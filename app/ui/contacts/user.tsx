'use client';

import {
  ChatBubbleOvalLeftIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';
import { UserIcon as UserIconSolid } from '@heroicons/react/24/solid';
import { useEffect, useRef, useState } from 'react';
import { FriendRequestInfo, UserInfo } from '@/app/lib/types';
import { useBubble, useBubbleDispatch } from '../bubble/provider';
import { useHandlerState } from '@/app/ui/component/useHandlerState';
import { deleteFriend, fetchUser, sendFriendRequest } from '@/app/lib/socket';
import { FriendRequest, FriendRequestStatus } from '@prisma/client';
import { useFormStatus } from 'react-dom';
import { getDateAndTime, ActionFailedTips, chatWithUser } from '../util';
import {
  handleFriendRequest,
  useFriendRequests,
  useFriendRequestsDispatch,
} from './friend-request';
import { useDebouncedCallback } from 'use-debounce';
import clsx from 'clsx';

enum UserRelationship {
  self,
  friend,
  stranger,
}

function getRelationship(userInfo: UserInfo, uid: string) {
  return userInfo.id === uid
    ? UserRelationship.self
    : userInfo.friendIDs.find((id) => id === uid) !== undefined ||
        userInfo.friendOfIDs.find((id) => id === uid) !== undefined
      ? UserRelationship.friend
      : UserRelationship.stranger;
}

export function LoadUserProfile({
  userID,
  user,
  friendRequest,
  onAction,
}: {
  userID: string;
  user?: UserInfo;
  friendRequest?: FriendRequest;
  onAction?: {
    clickMessage?: () => void;
  };
}) {
  const { uid: currentUserID, user: currentUser, users, io } = useBubble();

  const dispatchBubble = useBubbleDispatch();
  const userInfo =
    (userID === currentUserID ? currentUser : users?.[userID]) ?? user;

  useEffect(() => {
    fetchUser(userID, undefined, dispatchBubble, io);
  }, [userID, dispatchBubble, io]);

  if (!userInfo || !currentUser) {
    return (
      <div className="text-sm text-gray-500">
        User not found. Check and try again.
      </div>
    );
  }

  return (
    <UserProfile
      user={userInfo}
      relationship={getRelationship(currentUser, userInfo.id)}
      friendRequest={friendRequest}
      onAction={onAction}
    />
  );
}

function UserProfile({
  user,
  relationship,
  friendRequest,
  onAction,
}: {
  user: UserInfo;
  relationship: UserRelationship;
  friendRequest?: FriendRequest;
  onAction?: {
    clickMessage?: () => void;
  };
}) {
  const [showMenu, setShowMenu] = useState(false);
  useEffect(() => {
    setShowMenu(false);
  }, [user]);

  return (
    <div
      className="flex h-full w-96 flex-col"
      onClick={() => setShowMenu(false)}
    >
      <div className="mb-4 flex w-full">
        <div className="mr-4 flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-md bg-neutral-300">
          <UserIconSolid className="h-8 text-sm text-gray-400" />
        </div>
        <div className="mr-3 flex flex-grow flex-col">
          <div className="scrollbar-track-bg-neutral-200 mb-1 max-h-16 overflow-auto break-all text-sm scrollbar-none scrollbar-thumb-neutral-300">
            {user.nickname}
          </div>
          <div className="scrollbar-track-bg-neutral-200 max-h-12 overflow-auto break-all text-xs text-gray-500 scrollbar-none scrollbar-thumb-neutral-300">
            {`Username:${user.username}`}
          </div>
        </div>
        {relationship === UserRelationship.friend ? (
          <div className="relative h-fit flex-shrink-0">
            <button>
              <EllipsisHorizontalIcon
                className="w-5 rounded-md text-gray-500 hover:bg-gray-200"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
              />
            </button>
            {showMenu ? (
              <div className="absolute right-0 top-5 mt-2 flex h-max w-max flex-col border border-neutral-300 bg-white shadow-md">
                <DeleteContactButton user={user} />
              </div>
            ) : (
              <></>
            )}
          </div>
        ) : (
          <></>
        )}
      </div>

      <DivideLine />
      <div className="my-4 flex w-full">
        <div className="mr-3 w-14 flex-shrink-0 text-center text-gray-500 ">
          Bio
        </div>
        <div className="scrollbar-track-bg-neutral-200 mr-3 max-h-56 overflow-auto break-all scrollbar-none scrollbar-thumb-neutral-300">
          {user.bio}
        </div>
      </div>

      <DivideLine />
      <UserAction
        user={user}
        relationship={relationship}
        friendRequest={friendRequest}
        onAction={onAction}
      />
    </div>
  );
}

function DeleteContactButton({ user }: { user: UserInfo }) {
  const { uid, io } = useBubble();
  const dispatchBubble = useBubbleDispatch();
  const userID = user.id;
  const [handlers, dispatchHandlers] = useHandlerState<{
    deleting?: boolean;
    finished?: boolean;
    ok?: boolean;
  }>();

  useEffect(() => {
    dispatchHandlers({
      type: 'remove',
      filterFunc: (key, value) => key !== userID && !!value.finished,
    });
  }, [userID, dispatchHandlers]);

  const deleteContact = useDebouncedCallback(
    () => {
      dispatchHandlers({
        type: 'add',
        id: userID,
        value: {
          deleting: true,
        },
      });
      deleteFriend(
        { uid: uid, friendUID: user.id },
        dispatchBubble,
        io,
        (ok) => {
          dispatchHandlers({
            type: 'update',
            id: userID,
            value: {
              deleting: false,
              finished: true,
              ok: ok,
            },
          });
        },
      );
    },
    300,
    { leading: true },
  );
  const currentHandler = handlers[userID];
  const disabled = !!currentHandler?.deleting;
  const finished = !!currentHandler?.finished;
  const ok = !!currentHandler?.ok;
  return (
    <button
      aria-disabled={disabled}
      disabled={disabled}
      className="border-b border-neutral-200 px-5 py-1 text-left text-xs last:border-0 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 hover:bg-neutral-300"
      onClick={(e) => {
        e.stopPropagation();
        deleteContact();
      }}
    >
      {`Delete Contact`}
      <span
        className={clsx('ml-2', {
          hidden: !finished,
          'text-green-600': ok,
          'text-red-600': !ok,
        })}
      >
        {ok ? 'Done' : 'Failed'}
      </span>
    </button>
  );
}

function UserAction({
  user,
  relationship,
  friendRequest,
  onAction,
}: {
  user: UserInfo;
  relationship: UserRelationship;
  friendRequest?: FriendRequest;
  onAction?: {
    clickMessage?: () => void;
  };
}) {
  if (relationship === UserRelationship.self) {
    return <></>;
  }
  if (relationship === UserRelationship.friend) {
    return <FriendAction user={user} clickMessage={onAction?.clickMessage} />;
  }
  if (friendRequest) {
    return <FriendRequestAction friendRequest={friendRequest} />;
  }

  return <StrangerAction user={user} />;
}

function StrangerAction({ user }: { user: UserInfo }) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { user: currentUser, io } = useBubble();
  const dispatchBubble = useBubbleDispatch();
  const [handlers, dispatchHandlers] = useHandlerState<{
    adding?: boolean;
    handling?: boolean;
    message?: string;
    finished?: boolean;
    ok?: boolean;
  }>();

  const defaultRequestMessage = `I'm ${currentUser?.nickname ?? ''}`;
  const currentHandler = handlers[user.id];
  const requestMessage = currentHandler?.message ?? defaultRequestMessage;
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = requestMessage;
    }
    dispatchHandlers({
      type: 'remove',
      filterFunc: (key, value) => key !== user.id && !!value.finished,
    });
  }, [user, requestMessage, dispatchHandlers]);

  function setIsAdding(adding: boolean) {
    dispatchHandlers({
      type: 'upsert',
      id: user.id,
      value: {
        adding: adding,
      },
    });
  }

  function addUser() {
    const message = inputRef.current?.value ?? '';
    dispatchHandlers({
      type: 'upsert',
      id: user.id,
      value: {
        adding: true,
        handling: true,
        message: message,
      },
    });
    sendFriendRequest(
      { senderID: currentUser!.id, receiverID: user.id, message: message },
      dispatchBubble,
      io,
      (ok) => {
        dispatchHandlers({
          type: 'update',
          id: user.id,
          value: {
            handling: false,
            finished: true,
            ok: ok,
          },
        });
      },
    );
  }

  if (currentHandler && currentHandler.adding) {
    const isSending = !!currentHandler.handling;
    const haveSendResult = !!currentHandler.finished;
    const isSendOK = !!currentHandler.ok;
    const disabled = isSending || isSendOK;
    return (
      <div className="mt-6 flex w-full flex-shrink-0 flex-col">
        <div className="text-xs text-gray-500">Send Friend Request</div>
        <textarea
          name={'friend-request-message'}
          ref={inputRef}
          aria-disabled={disabled}
          disabled={disabled}
          className="scrollbar-track-bg-neutral-200 mb-5 h-20 w-full resize-none appearance-none overflow-y-auto rounded-lg border-transparent bg-neutral-300 px-5 pb-4 scrollbar-none aria-disabled:opacity-50 focus:border-transparent focus:ring-0"
          defaultValue={defaultRequestMessage}
        />
        {!isSendOK && (
          <div className="flex justify-center pb-5">
            <button
              disabled={disabled}
              aria-disabled={disabled}
              className="flex h-8 w-32 flex-shrink-0 items-center justify-center rounded-sm bg-yellow-600 text-center text-white aria-disabled:opacity-50 hover:bg-yellow-700"
              onClick={() => !disabled && addUser()}
            >
              Send
            </button>
            <button
              disabled={disabled}
              aria-disabled={disabled}
              className="ml-5 flex h-8 w-32 flex-shrink-0 items-center justify-center rounded-sm bg-neutral-300 text-center text-gray-800 aria-disabled:opacity-50 hover:bg-neutral-400"
              onClick={() => !disabled && setIsAdding(false)}
            >
              Cancel
            </button>
          </div>
        )}
        {haveSendResult && (
          <div className="flex justify-center pb-5 text-gray-500">
            {isSendOK ? 'Sent' : ActionFailedTips}
          </div>
        )}
      </div>
    );
  }
  return (
    <button
      className="mb-5 mt-6 flex h-10 flex-shrink-0 items-center self-center bg-green-600 px-9 text-sm font-medium text-white transition-colors aria-disabled:cursor-not-allowed aria-disabled:opacity-50 hover:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-800 active:bg-green-600"
      onClick={() => setIsAdding(true)}
    >
      {'Add to Contacts'}
    </button>
  );
}

function FriendRequestAction({
  friendRequest: initFriendRequest,
}: {
  friendRequest: FriendRequestInfo;
}) {
  const { uid, io, friendRequests } = useBubble();
  const dispatchBubble = useBubbleDispatch();
  const handlingActions = useFriendRequests();
  const dispatchActions = useFriendRequestsDispatch();

  const friendRequestID = initFriendRequest.id;
  const friendRequest = friendRequests?.[friendRequestID] ?? initFriendRequest;
  const currentHandler = handlingActions[friendRequestID];
  const disabled = currentHandler?.handling === true;
  const { senderID, message, createdAt, status } = friendRequest;
  const selfSent = uid === senderID;
  const createTime = getDateAndTime(createdAt, true);
  const statusInfo =
    status === FriendRequestStatus.Accepted
      ? 'Added'
      : status === FriendRequestStatus.Refused
        ? 'Rejected'
        : 'Waiting';
  const requestHandled =
    status === FriendRequestStatus.Accepted ||
    status === FriendRequestStatus.Refused;
  return (
    <div className="mt-5 flex w-full flex-shrink-0 flex-col">
      <div className="mx-1 flex justify-between text-xs text-gray-500">
        <div>Friend Request</div>
        <div>{createTime}</div>
      </div>
      <div className="scrollbar-track-bg-neutral-200 mb-5 max-h-32 flex-shrink-0 overflow-auto break-all rounded-md bg-gray-200 p-3 text-gray-700 scrollbar-thin scrollbar-thumb-neutral-300">
        {message}
      </div>
      {selfSent || requestHandled ? (
        <div className="flex justify-center text-gray-500">{statusInfo}</div>
      ) : (
        <div className="flex justify-center pb-5">
          <button
            disabled={disabled}
            aria-disabled={disabled}
            className="flex h-8 w-32 flex-shrink-0 items-center justify-center rounded-sm bg-yellow-600 text-center text-white aria-disabled:opacity-50 hover:bg-yellow-700"
            onClick={() =>
              handleFriendRequest(
                true,
                friendRequest,
                dispatchActions,
                dispatchBubble,
                io,
              )
            }
          >
            Accept
          </button>
          <button
            disabled={disabled}
            aria-disabled={disabled}
            className="ml-5 flex h-8 w-32 flex-shrink-0  items-center justify-center rounded-sm bg-neutral-300 text-center text-gray-800 aria-disabled:opacity-50 hover:bg-neutral-400"
            onClick={() =>
              handleFriendRequest(
                false,
                friendRequest,
                dispatchActions,
                dispatchBubble,
                io,
              )
            }
          >
            Reject
          </button>
        </div>
      )}
      {currentHandler?.finished && !currentHandler?.ok ? (
        <div className="flex justify-center pb-5 text-sm text-gray-500">
          {ActionFailedTips}
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}

function FriendAction({
  user,
  clickMessage,
}: {
  user: UserInfo;
  clickMessage?: () => void;
}) {
  const { channels, uid } = useBubble();
  const dispatch = useBubbleDispatch();

  return (
    <form
      className="mt-7 flex w-full justify-center text-sky-800"
      action={() => {
        clickMessage?.();
        chatWithUser(user.id, uid, channels, dispatch);
      }}
    >
      <MessageButton />
    </form>
  );
}

function MessageButton() {
  const { pending } = useFormStatus();
  return (
    <button
      aria-disabled={pending}
      disabled={pending}
      className="flex flex-col items-center justify-center rounded-sm px-2 py-1 aria-disabled:opacity-50 hover:bg-gray-200"
    >
      <ChatBubbleOvalLeftIcon className="w-6 flex-shrink text-xs" />
      <div className="flex-shrink text-xs">Messages</div>
    </button>
  );
}

function DivideLine() {
  return <div className="h-px w-full flex-shrink-0 bg-gray-200" />;
}
