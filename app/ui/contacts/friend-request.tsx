import { FriendRequestInfo } from '@/app/lib/types';
import {
  BubbleDispatchType,
  useBubble,
  useBubbleDispatch,
} from '../bubble/provider';
import { Frame } from '../component/frame';
import { ActionFailedTips, chatWithUser, sortFriendRequests } from '../util';
import {
  useHandlerState,
  HandlerActionType,
} from '@/app/ui/component/useHandlerState';

import { UserIcon } from '@heroicons/react/24/solid';
import { ArrowUpRightIcon } from '@heroicons/react/24/outline';
import { FriendRequestStatus } from '@prisma/client';
import { LoadUserProfile } from './user';
import { Context, createContext, Dispatch, useContext, useState } from 'react';
import { Socket } from 'socket.io-client';
import { updateFriendRequest } from '@/app/lib/socket';

type FriendRequestsHandlerState = {
  handling: boolean;
  finished?: boolean;
  ok?: boolean;
};

const FriendRequestsContext: Context<
  Record<string, FriendRequestsHandlerState>
> = createContext(null as any);

const FriendRequestsDispatchContext: Context<
  Dispatch<HandlerActionType<FriendRequestsHandlerState>>
> = createContext(null as any);

export function useFriendRequests() {
  return useContext(FriendRequestsContext);
}

export function useFriendRequestsDispatch() {
  return useContext(FriendRequestsDispatchContext);
}

export function FriendRequestsTable() {
  const { friendRequests, uid } = useBubble();
  const [context, dispatch] = useHandlerState<{
    handling: boolean;
    finished?: boolean;
    ok?: boolean;
  }>();

  const sortedRequests: FriendRequestInfo[] = sortFriendRequests(
    friendRequests ?? {},
  );

  const [selectRequest, setSelectRequest] = useState<
    FriendRequestInfo | undefined
  >(undefined);

  return (
    <FriendRequestsContext.Provider value={context}>
      <FriendRequestsDispatchContext.Provider value={dispatch}>
        <div
          className="h-full w-full"
          onClick={() => setSelectRequest(undefined)}
        >
          <Frame title={'New Friends'}>
            <div className="relative flex w-full flex-grow flex-col overflow-y-auto overflow-x-hidden">
              <div className="scrollbar-track-bg-neutral-200 flex flex-grow-0 flex-col overflow-y-auto overflow-x-hidden px-24 pb-3 scrollbar-thin scrollbar-thumb-neutral-300">
                {sortedRequests.map((request) => {
                  return (
                    <FriendRequestEntry
                      key={request.id}
                      friendRequest={request}
                      setSelectRequest={setSelectRequest}
                    />
                  );
                })}
              </div>
              {selectRequest === undefined ? (
                <></>
              ) : (
                <div
                  className="absolute mt-16 flex h-fit w-fit justify-center self-center rounded-md bg-white p-5 shadow-md"
                  onClick={(e) => e.stopPropagation()}
                >
                  <LoadUserProfile
                    userID={
                      selectRequest.senderID === uid
                        ? selectRequest.receiverID
                        : selectRequest.senderID
                    }
                    user={
                      selectRequest.senderID === uid
                        ? selectRequest.receiver
                        : selectRequest.sender
                    }
                    friendRequest={selectRequest}
                  />
                </div>
              )}
            </div>
          </Frame>
        </div>
      </FriendRequestsDispatchContext.Provider>
    </FriendRequestsContext.Provider>
  );
}

function FriendRequestEntry({
  friendRequest,
  setSelectRequest,
}: {
  friendRequest: FriendRequestInfo;
  setSelectRequest: (friendRequest?: FriendRequestInfo) => void;
}) {
  const { uid, io } = useBubble();
  const dispatchBubble = useBubbleDispatch();
  const handlingActions = useFriendRequests();
  const dispatchActions = useFriendRequestsDispatch();

  const { id, sender, receiver, senderID, message, status } = friendRequest;
  const selfSent = uid === senderID;
  const content = selfSent ? 'Me: ' + message : message;
  const withUser = selfSent ? receiver : sender;
  const name = withUser?.nickname;
  const currentHandler = handlingActions[id];
  const disabled = currentHandler?.handling === true;
  const failed = currentHandler?.finished && !currentHandler?.ok;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        setSelectRequest(friendRequest);
      }}
      className="flex h-20 w-full flex-shrink-0 items-center border-b last:border-b-0"
    >
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-sm bg-neutral-300">
        <UserIcon className="h-6 text-sm text-gray-400" />
      </div>
      <div className="ml-3 flex h-12 w-full flex-col overflow-hidden">
        <div className="line-clamp-1 overflow-hidden text-ellipsis break-all">
          {name}
        </div>
        <div className="line-clamp-1 overflow-hidden text-ellipsis break-all text-gray-500">
          {content}
        </div>
      </div>

      {selfSent ? (
        <div className="ml-5 flex h-8 flex-shrink-0 flex-grow items-center justify-end rounded-sm  text-center text-gray-500">
          <ArrowUpRightIcon className="mr-2 w-5" />
          {status === FriendRequestStatus.Accepted
            ? 'Added'
            : status === FriendRequestStatus.Refused
              ? 'Rejected'
              : 'Waiting'}
        </div>
      ) : status === FriendRequestStatus.Accepted ||
        status === FriendRequestStatus.Refused ? (
        <div className="ml-5 flex h-8 flex-shrink-0 flex-grow items-center justify-end rounded-sm text-center  text-gray-500">
          {status === FriendRequestStatus.Accepted ? 'Added' : 'Rejected'}
        </div>
      ) : (
        <div className="flex flex-shrink-0 flex-col items-end">
          <div className="flex w-fit">
            <button
              aria-disabled={disabled}
              disabled={disabled}
              className="ml-5 flex h-8 w-20 flex-shrink-0 flex-grow items-center justify-center rounded-sm bg-yellow-600 text-center text-white aria-disabled:opacity-50 hover:bg-yellow-700"
              onClick={(e) => {
                e.stopPropagation();
                setSelectRequest(undefined);
                handleFriendRequest(
                  true,
                  friendRequest,
                  dispatchActions,
                  dispatchBubble,
                  io,
                );
              }}
            >
              Accept
            </button>
            <button
              disabled={disabled}
              aria-disabled={disabled}
              className="ml-1 flex h-8 w-20 flex-shrink-0 flex-grow items-center justify-center rounded-sm bg-neutral-300 text-center text-gray-800 aria-disabled:opacity-50 hover:bg-neutral-400"
              onClick={(e) => {
                e.stopPropagation();
                setSelectRequest(undefined);
                handleFriendRequest(
                  false,
                  friendRequest,
                  dispatchActions,
                  dispatchBubble,
                  io,
                );
              }}
            >
              Reject
            </button>
          </div>
          {failed ? (
            <div className="flex justify-center text-sm text-gray-500">
              {ActionFailedTips}
            </div>
          ) : (
            <></>
          )}
        </div>
      )}
    </div>
  );
}

export function handleFriendRequest(
  accept: boolean,
  friendRequest: FriendRequestInfo,
  dispatchActions: Dispatch<HandlerActionType<FriendRequestsHandlerState>>,
  dispatchBubble: Dispatch<BubbleDispatchType>,
  io?: Socket | null,
) {
  dispatchActions({
    type: 'add',
    id: friendRequest.id,
    value: {
      handling: true,
    },
  });
  updateFriendRequest(
    {
      id: friendRequest.id,
      senderID: friendRequest.senderID,
      receiverID: friendRequest.receiverID,
      status: accept
        ? FriendRequestStatus.Accepted
        : FriendRequestStatus.Refused,
    },
    dispatchBubble,
    io,
    (ok, data) => {
      if (ok) {
        dispatchActions({
          type: 'remove',
          filterFunc: (key) => key === friendRequest.id,
        });
      } else {
        dispatchActions({
          type: 'update',
          id: friendRequest.id,
          value: {
            handling: false,
            finished: true,
            ok: false,
          },
        });
      }
      if (accept && ok && data?.channels) {
        chatWithUser(
          friendRequest.senderID,
          friendRequest.receiverID,
          data.channels,
          dispatchBubble,
        );
      }
    },
  );
}
