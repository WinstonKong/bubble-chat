import {
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PencilIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { UserIcon } from '@heroicons/react/24/solid';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useBubble, useBubbleDispatch } from '../../../bubble/provider';
import { fetchUser, updateChannelName } from '@/app/lib/socket';
import {
  SearchContactProvider,
  useSearchContact,
} from '../../../search/search-contact-provider';
import { noFunc, searchUsers } from '../../../util';
import { SearchGroupMember } from './search-group-member';
import { useChatInfo } from './chat-info';
import { AddMemberButton } from './add-member';
import { useEditInfo } from '../../../component/useEditInfo';

export function GroupChatInfo() {
  const { setSelectUserID } = useChatInfo();

  return (
    <div
      className="scrollbar-track-bg-neutral-200 verflow-y-auto h-full w-64 flex-shrink-0 overflow-auto overflow-x-hidden border-l border-neutral-300 scrollbar-thin scrollbar-thumb-neutral-300"
      onClick={(e) => {
        setSelectUserID(undefined);
        e.stopPropagation();
      }}
    >
      <SearchContactProvider onCancel={noFunc} exitAfterEnter={false}>
        <div className="flex flex-col">
          <div className="ml-6 mt-3 w-52 pr-2">
            <SearchGroupMember />
          </div>
          <GroupMembersPanel />
        </div>
      </SearchContactProvider>
      <div className="ml-4 mt-3 h-px w-56  flex-shrink-0 bg-neutral-200" />
      <GroupName />
      <div className="ml-4 mt-3 h-px w-56  flex-shrink-0 bg-neutral-200" />
      <LeaveGroup />
      <div className="ml-4 mt-3 h-px w-56  flex-shrink-0 bg-neutral-200" />
    </div>
  );
}

function LeaveGroup() {
  const { setShowLeaving } = useChatInfo();

  return (
    <button
      className="ml-4 w-56 pt-3 text-green-600"
      onClick={() => setShowLeaving(true)}
    >
      Leave
    </button>
  );
}

function GroupName() {
  const { uid, io } = useBubble();
  const dispatchBubble = useBubbleDispatch();
  const { channel } = useChatInfo();
  const inputRef = useRef<HTMLInputElement>(null);

  const { id, name, ownerID, adminIDs } = channel;
  const [editInfo, dispatchEdit] = useEditInfo(
    ownerID === uid || adminIDs.find((id) => id === uid) !== undefined,
  );
  const { editable, editing, updating, finished, ok } = editInfo;
  const nameText = name ?? '';

  const updateName = () => {
    dispatchEdit({ type: 'setUpdating' });
    const newName = inputRef.current?.value;
    if (newName === undefined) {
      dispatchEdit({ type: 'setResult', ok: false });
      return;
    }
    if (newName === name) {
      dispatchEdit({ type: 'setResult', ok: true });
      return;
    }
    updateChannelName(
      {
        uid: uid,
        channelID: id,
        newName: newName,
      },
      dispatchBubble,
      io,
      (ok) => dispatchEdit({ type: 'setResult', ok: ok }),
    );
  };

  return (
    <div className="ml-4 flex flex-col">
      <div className="mt-4 flex flex-col">
        <div className="">Group Name</div>
        <div className="mt-1 flex w-56 items-center text-sm text-neutral-500">
          {editing && !(finished && ok) ? (
            <>
              <input
                aria-disabled={updating}
                disabled={updating}
                name={'search-group-member'}
                ref={inputRef}
                className="h-5 w-52 appearance-none border-transparent bg-neutral-200 py-2 text-sm aria-disabled:opacity-50 focus:border focus:border-neutral-200 focus:bg-neutral-50 focus:text-opacity-100 focus:ring-0"
                defaultValue={nameText}
                type="text"
                autoFocus={true}
                onFocus={() => {
                  if (inputRef.current) {
                    const value = inputRef.current.value;
                    inputRef.current.setSelectionRange(
                      value.length,
                      value.length,
                    );
                  }
                }}
                onBlur={() => {
                  updateName();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    dispatchEdit({ type: 'reset' });
                  } else if (e.key === 'Enter') {
                    updateName();
                  }
                }}
              />
              {!!updating && <ArrowPathIcon className="h-5 animate-spin" />}
              {!!finished && !ok && <ExclamationCircleIcon className="h-5" />}
            </>
          ) : (
            <>
              {editable ? (
                <button
                  className="peer truncate"
                  onClick={() => dispatchEdit({ type: 'setEditing' })}
                >
                  {nameText}
                </button>
              ) : (
                <div className="truncate">{nameText}</div>
              )}
              <PencilIcon className="ml-1 hidden w-3 flex-shrink-0 peer-hover:inline" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function GroupMembersPanel() {
  const { searchText } = useSearchContact();
  const { channel } = useChatInfo();
  const [showLess, setShowLess] = useState(true);
  const { userIDs } = channel;
  const isSearching = searchText !== undefined && searchText.length > 0;
  const userCountGT15 = userIDs.length > 15;
  const uids =
    !isSearching && showLess && userCountGT15 ? userIDs.slice(0, 15) : userIDs;

  return (
    <>
      <div className="ml-4 mt-3 grid w-56 grow-0 grid-cols-4">
        {uids.map((uid) => {
          return <GroupMember key={uid} userID={uid} />;
        })}
        {!isSearching && <AddMemberButton />}
      </div>
      {!isSearching && userCountGT15 && (
        <button
          className="flex w-56 items-center justify-center pt-2 text-neutral-400"
          onClick={(e) => {
            e.stopPropagation();
            setShowLess(!showLess);
          }}
        >
          <span className="ml-8">{showLess ? 'Show All' : 'Show Less'}</span>
          {showLess ? (
            <ChevronDownIcon className="ml-2 w-4" />
          ) : (
            <ChevronUpIcon className="ml-2 w-4" />
          )}
        </button>
      )}
    </>
  );
}

function GroupMember({ userID }: { userID: string }) {
  const { setSelectUserID } = useChatInfo();
  const { searchText } = useSearchContact();
  const { uid: currentUserID, user: currentUser, users, io } = useBubble();
  const dispatchBubble = useBubbleDispatch();
  const userInfo = userID === currentUserID ? currentUser : users?.[userID];
  const show = useMemo(
    () =>
      searchText === undefined || searchText.length === 0
        ? true
        : !userInfo
          ? false
          : searchUsers(searchText, [userInfo]).length > 0,
    [searchText, userInfo],
  );

  useEffect(() => {
    if (!userInfo) {
      fetchUser(userID, undefined, dispatchBubble, io);
    }
  }, [userID, dispatchBubble, io, userInfo]);

  if (!show) {
    return <></>;
  }

  return (
    <button
      className="flex h-max w-12 flex-grow-0 flex-col items-center overflow-hidden pt-2"
      onClick={(e) => {
        e.stopPropagation();
        setSelectUserID(userID);
      }}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-neutral-200">
        <UserIcon className="h-5 text-sm text-gray-400" />
      </div>
      <div className="my-1 h-4 w-12 truncate text-center text-xs">
        {userInfo?.nickname ?? ''}
      </div>
    </button>
  );
}
