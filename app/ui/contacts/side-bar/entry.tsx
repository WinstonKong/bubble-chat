import {
  UserPlusIcon as UserPlusIconSolid,
  UserIcon as UserIconSolid,
  UserGroupIcon as UserGroupIconSolid,
} from '@heroicons/react/24/solid';
import clsx from 'clsx';
import { getGroups } from '../../util';
import { useEffect, useMemo } from 'react';
import { useContact } from '../provider';
import { useBubble, useBubbleDispatch } from '../../bubble/provider';
import { updateFriendRequest } from '@/app/lib/socket';
import { UserInfo } from '@/app/lib/types';
import { FriendRequestStatus } from '@prisma/client';
import { UnreadCount } from '../../component/unread';
import { useSortFriends } from '../../component/useSortFriends';

export function ContactsEntries() {
  return (
    <div className="scrollbar-track-bg-neutral-200 flex h-full w-full flex-col overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-neutral-300">
      <NewFriendsEntry />
      <GroupsTable />
      <FriendsTable />
    </div>
  );
}

function NewFriendsEntry() {
  const { context, setContext } = useContact();
  const { showFriendRequests } = context;
  const { uid, friendRequests, io } = useBubble();
  const dispatchBubble = useBubbleDispatch();
  const unreadRequests = useMemo(() => {
    return Object.values(friendRequests ?? {}).filter(
      (request) =>
        request.receiverID === uid &&
        request.status === FriendRequestStatus.Sent,
    );
  }, [friendRequests, uid]);
  const unreadCount = unreadRequests.length;

  useEffect(() => {
    if (showFriendRequests && unreadCount > 0) {
      unreadRequests.forEach((request) =>
        updateFriendRequest(
          {
            id: request.id,
            senderID: request.senderID,
            receiverID: request.receiverID,
            status: FriendRequestStatus.Read,
          },
          dispatchBubble,
          io,
        ),
      );
    }
  }, [friendRequests, showFriendRequests, unreadRequests, dispatchBubble, io, unreadCount]);

  return (
    <div
      className="flex w-full flex-col"
      onClick={() => setContext({ showFriendRequests: true })}
    >
      <div className="h-9 w-full px-3 pt-4 text-sm text-gray-500">
        New Friends
      </div>
      <div
        className={clsx('flex h-14 items-center px-3 hover:bg-neutral-300', {
          'bg-neutral-300': context.showFriendRequests,
        })}
      >
        <div className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-sm bg-yellow-500">
          <UserPlusIconSolid className="h-6 text-sm text-white" />
          <UnreadCount count={unreadCount} />
        </div>
        <div className="ml-3 truncate">New Friends</div>
      </div>
    </div>
  );
}

function FriendsTable() {
  const { context, setContext } = useContact();
  const sortedFriends = useSortFriends();

  return (
    <>
      {Object.entries(sortedFriends).map((entry) => {
        const [letter, friends] = entry;
        return (
          <div key={letter} className="flex w-full flex-col">
            <div className="h-9 w-full px-3 pt-4 text-sm text-gray-500">
              {letter}
            </div>
            {friends.map((u) => (
              <FriendEntry
                key={u.id}
                user={u}
                selected={context.selectedUser?.id === u.id}
                onClick={() => setContext({ selectedUser: u })}
              />
            ))}
          </div>
        );
      })}
    </>
  );
}

function FriendEntry({
  user,
  selected,
  onClick,
}: {
  user: UserInfo;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className={clsx('flex h-14 items-center px-3 hover:bg-neutral-300', {
        'bg-neutral-300': selected,
      })}
      onClick={onClick}
    >
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-sm bg-neutral-300">
        <UserIconSolid className="h-5 text-sm text-gray-400" />
      </div>
      <div className="ml-3 truncate">{user.nickname}</div>
    </div>
  );
}

function GroupsTable() {
  const { context, setContext } = useContact();

  const { channels } = useBubble();
  const sortedGroups = useMemo(
    () => getGroups(channels).sort((a, b) => a.name!.localeCompare(b.name!)),
    [channels],
  );
  if (sortedGroups.length === 0) {
    return <></>;
  }

  return (
    <>
      <div className="flex w-full flex-col">
        <div className="h-9 w-full px-3 pt-4 text-sm text-gray-500">Groups</div>
        {sortedGroups.map((group) => (
          <div
            key={group.id}
            className={clsx(
              'flex h-14 items-center px-3 hover:bg-neutral-300',
              {
                'bg-neutral-300': context.selectedGroup?.id === group.id,
              },
            )}
            onClick={() => setContext({ selectedGroup: group })}
          >
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-sm bg-neutral-300">
              <UserGroupIconSolid className="h-5 text-sm text-gray-400" />
            </div>
            <div className="ml-3 truncate">{group.name}</div>
          </div>
        ))}
      </div>
    </>
  );
}
