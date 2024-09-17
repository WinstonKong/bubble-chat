import { UserInfo } from '@/app/lib/types';
import { useBubble } from '../../bubble/provider';
import { useSortFriends } from '../../component/useSortFriends';
import { useSearchContact } from '../../search/search-contact-provider';
import clsx from 'clsx';
import { UserIcon } from '@heroicons/react/24/solid';
import { getFriends, searchUsers } from '../../util';
import { CheckIcon } from '@heroicons/react/24/outline';
import {
  useCreateGroup,
  useCreateGroupDispatch,
} from './create-group-provider';
import { useEffect, useMemo } from 'react';
import { useChat } from '../provider';

export function ContactPanel() {
  const { searchText } = useSearchContact();
  return (
    <div className="scrollbar-track-bg-neutral-200 flex h-full w-full flex-col overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-neutral-300">
      {searchText === undefined || searchText === '' ? (
        <ContactTable />
      ) : (
        <SearchFriendTable />
      )}
    </div>
  );
}

function ContactTable() {
  const { createNewGroup } = useChat();
  const dmUserID = createNewGroup?.dmUser?.id;
  const existedMembers = createNewGroup?.addToChannel?.existedMembers;
  const isExistedMembers = (uid: string) =>
    uid === dmUserID || !!existedMembers?.has(uid);

  const { selectedUser, newGroupUsers, isCreating } = useCreateGroup();
  const dispatch = useCreateGroupDispatch();
  const sortedFriends = useSortFriends();
  return (
    <div className="flex h-full w-full flex-col">
      {Object.entries(sortedFriends)
        .slice(0, 200)
        .map((entry) => {
          const [letter, friends] = entry;
          return (
            <div key={letter} className="flex w-full flex-col">
              <div className="flex h-6 w-full items-center pl-7 text-sm text-gray-500">
                {letter}
              </div>
              {friends.map((u) => {
                const isPresetMember = isExistedMembers(u.id);
                return (
                  <FriendEntry
                    key={u.id}
                    user={u}
                    selected={selectedUser === u.id}
                    inNewGroup={!!newGroupUsers?.[u.id]}
                    disabled={isCreating}
                    isPresetMember={isPresetMember}
                    onClick={() => {
                      dispatch({
                        type: 'setSelectedUser',
                        selectedUser: u.id,
                      });
                      if (!isPresetMember) {
                        dispatch({
                          type: 'toggleUser',
                          user: u,
                        });
                      }
                    }}
                  />
                );
              })}
            </div>
          );
        })}
    </div>
  );
}

function SearchFriendTable() {
  const { createNewGroup } = useChat();
  const dmUserID = createNewGroup?.dmUser?.id;
  const existedMembers = createNewGroup?.addToChannel?.existedMembers;
  const isExistedMembers = (uid: string) =>
    uid === dmUserID || !!existedMembers?.has(uid);
  const { selectedUser, newGroupUsers, isCreating } = useCreateGroup();
  const dispatch = useCreateGroupDispatch();
  const { searchText } = useSearchContact();
  const { user, users } = useBubble();
  const sortedFriends = useMemo(
    () =>
      searchText === undefined || searchText.length === 0
        ? []
        : searchUsers(searchText, getFriends(user, users)),
    [searchText, user, users],
  );

  useEffect(() => {
    if (sortedFriends.length > 0) {
      const user = sortedFriends[0].user;
      dispatch({
        type: 'setSelectedUser',
        selectedUser: user.id,
      });
    }
  }, [searchText, sortedFriends, dispatch]);

  return (
    <div className="flex h-full w-full flex-col">
      {sortedFriends.map(({ user: u }) => {
        const isPresetMember = isExistedMembers(u.id);
        return (
          <FriendEntry
            key={u.id}
            user={u}
            selected={selectedUser === u.id}
            inNewGroup={!!newGroupUsers?.[u.id]}
            disabled={isCreating}
            isPresetMember={isPresetMember}
            onClick={() => {
              dispatch({
                type: 'setSelectedUser',
                selectedUser: u.id,
              });
              if (!isPresetMember) {
                dispatch({
                  type: 'toggleUser',
                  user: u,
                });
              }
            }}
          />
        );
      })}
    </div>
  );
}

function FriendEntry({
  user,
  selected,
  inNewGroup,
  disabled,
  isPresetMember,
  onClick,
}: {
  user: UserInfo;
  selected: boolean;
  inNewGroup: boolean;
  disabled: boolean;
  isPresetMember: boolean;
  onClick: () => void;
}) {
  return (
    <button
      aria-disabled={disabled}
      disabled={disabled}
      className={clsx('flex h-12 items-center pl-7 pr-3 hover:bg-neutral-200', {
        'bg-neutral-300': selected,
        'hover:bg-neutral-300': selected,
      })}
      onClick={() => {
        if (!isPresetMember) {
          onClick();
        }
      }}
    >
      <div
        className={clsx(
          'mr-3 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full',
          {
            'bg-green-500': !isPresetMember && inNewGroup,
            'border-2 border-gray-200 bg-white': !isPresetMember && !inNewGroup,
            'bg-green-200': isPresetMember,
          },
        )}
      >
        <CheckIcon
          className={clsx('w-3 font-bold text-white', {
            hidden: !isPresetMember && !inNewGroup,
          })}
        />
      </div>
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-neutral-300">
        <UserIcon className="h-4 text-sm text-gray-400" />
      </div>
      <div className="ml-3 truncate">{user.nickname}</div>
    </button>
  );
}
