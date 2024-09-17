'use client';

import { UserIcon } from '@heroicons/react/24/solid';
import { useBubble, useBubbleDispatch } from '../bubble/provider';
import { Frame } from '../component/frame';
import { useEffect, useState } from 'react';
import { fetchUser } from '@/app/lib/socket';
import { ChannelInfo } from '@/app/lib/types';
import { chatToChannel } from '../util';
import { LoadUserProfile } from './user';

export function GroupProfile({ group }: { group: ChannelInfo }) {
  const dispatch = useBubbleDispatch();
  const {id: groupID, userIDs: uids, name} = group
  const title = `${name!}(${uids.length})`;

  const [selectUserID, setSelectUserID] = useState<string | undefined>(
    undefined,
  );
  useEffect(() => {
    setSelectUserID(undefined);
  }, [groupID]);

  return (
    <Frame title={title} onClick={() => setSelectUserID(undefined)}>
      <>
        <div className="relative mt-4 flex w-full flex-grow flex-col justify-between overflow-y-auto overflow-x-hidden">
          <div
            className="scrollbar-track-bg-neutral-200 grid flex-grow-0 grid-cols-[repeat(auto-fit,5rem)] justify-between gap-y-1 
           overflow-y-auto overflow-x-hidden px-20 scrollbar-thin scrollbar-thumb-neutral-300 
          "
          >
            {uids.map((uid, i) => {
              return (
                <GroupUser
                  key={uid}
                  uid={uid}
                  onClick={() => setSelectUserID(uid)}
                />
              );
            })}
          </div>
          {selectUserID === undefined ? (
            <></>
          ) : (
            <div
              className="absolute mt-32 flex h-fit w-fit justify-center self-center rounded-md bg-white p-5 shadow-md"
              onClick={(e) => e.stopPropagation()}
            >
              <LoadUserProfile userID={selectUserID} />
            </div>
          )}
        </div>
        <button
          className="mb-11 mt-6 flex h-10 flex-shrink-0 items-center self-center bg-green-600 px-9 text-sm font-medium text-white transition-colors aria-disabled:cursor-not-allowed aria-disabled:opacity-50 hover:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-800 active:bg-green-600"
          onClick={() => {
            chatToChannel(groupID, dispatch);
          }}
        >
          Messages
        </button>
      </>
    </Frame>
  );
}

function GroupUser({ uid, onClick }: { uid: string; onClick: () => void }) {
  const { users, io, user: currentUser, uid: currentUserID } = useBubble();
  const dispatchBubble = useBubbleDispatch();
  const user = uid === currentUserID ? currentUser : users?.[uid];
  const name = user?.nickname ?? '';
  useEffect(() => {
    if (!user) {
      fetchUser(uid, undefined, dispatchBubble, io);
    }
  }, [user, io, dispatchBubble, uid]);

  return (
    <div
      className="flex h-28 w-20 flex-col items-center pt-2 hover:bg-neutral-200"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-sm bg-neutral-300">
        <UserIcon className="h-8 text-sm text-gray-400" />
      </div>
      <div className="mt-3 w-20 truncate overflow-ellipsis px-1 text-center text-sm">
        {name}
      </div>
    </div>
  );
}
