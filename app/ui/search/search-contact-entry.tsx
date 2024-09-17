import { Chunk } from 'highlight-words-core';
import {
  UserIcon as UserIconSolid,
  UserGroupIcon as UserGroupIconSolid,
} from '@heroicons/react/24/solid';
import clsx from 'clsx';
import {
  chatToChannel,
  chatWithUser,
  searchGroups,
  searchUsers,
  getFriends,
  getGroups,
} from '../util';
import { useEffect, useMemo } from 'react';
import { useBubble, useBubbleDispatch } from '../bubble/provider';
import {
  useSearchContact,
  useSearchContactDispatch,
} from './search-contact-provider';
import { ChannelInfo, UserInfo } from '@/app/lib/types';
import { DivideLine } from '../component/frame';

export function SearchFriendTable() {
  const { searchText } = useSearchContact();
  const dispatch = useSearchContactDispatch();
  const { user, users, uid, channels } = useBubble();
  const dispatchBubble = useBubbleDispatch();
  const sortedFriendsInfo = useMemo(
    () =>
      searchText === undefined || searchText.length === 0
        ? []
        : searchUsers(searchText, getFriends(user, users)),
    [searchText, user, users],
  );
  const sortedGroups = useMemo(
    () =>
      searchText === undefined || searchText.length === 0
        ? []
        : searchGroups(searchText, getGroups(channels)),
    [searchText, channels],
  );

  useEffect(() => {
    if (sortedFriendsInfo.length > 0) {
      const user = sortedFriendsInfo[0].user;
      dispatch({
        type: 'updateOnEnter',
        onEnter: () => {
          chatWithUser(user.id, uid, channels, dispatchBubble);
        },
      });
      return;
    }
    if (sortedGroups.length > 0) {
      const channel = sortedGroups[0].channel;
      dispatch({
        type: 'updateOnEnter',
        onEnter: () => {
          chatToChannel(channel.id, dispatchBubble);
        },
      });
      return;
    }
  }, [
    searchText,
    channels,
    dispatch,
    dispatchBubble,
    sortedFriendsInfo,
    sortedGroups,
    uid,
  ]);

  if (sortedFriendsInfo.length === 0 && sortedGroups.length === 0) {
    return <></>;
  }

  return (
    <div className="scrollbar-track-bg-neutral-200 flex w-full flex-col overflow-y-auto overflow-x-hidden bg-gray-100 scrollbar-thin scrollbar-thumb-neutral-300">
      <DivideLine />
      {sortedFriendsInfo.length > 0 ? (
        <div className="flex items-center px-3 py-1 text-sm  text-gray-500">
          Contacts
        </div>
      ) : (
        <></>
      )}
      <div className="flex w-full flex-col">
        {sortedFriendsInfo.map((info, i) => (
          <SearchFriendEntry
            key={info.user.id}
            sortInfo={info}
            selected={i === 0}
            onClick={() => {
              dispatch({
                type: 'clickEnter',
                onEnter: () =>
                  chatWithUser(info.user.id, uid, channels, dispatchBubble),
              });
            }}
          />
        ))}
      </div>
      {sortedGroups.length > 0 ? (
        <div className="flex items-center px-3 py-1 text-sm  text-gray-500">
          Groups
        </div>
      ) : (
        <></>
      )}
      {sortedGroups.map((info, i) => (
        <SearchGroupEntry
          key={info.channel.id}
          sortInfo={info}
          selected={i === 0 && sortedFriendsInfo.length === 0}
          onClick={() => {
            dispatch({
              type: 'clickEnter',
              onEnter: () => chatToChannel(info.channel.id, dispatchBubble),
            });
          }}
        />
      ))}
    </div>
  );
}

function SearchGroupEntry({
  selected,
  onClick,
  sortInfo,
}: {
  selected: boolean;
  onClick: () => void;
  sortInfo: {
    channel: ChannelInfo;
    chunks: Chunk[];
  };
}) {
  const { channel, chunks } = sortInfo;
  const { name } = channel;
  return (
    <div
      className={clsx('flex h-14 items-center px-3 hover:bg-neutral-300', {
        'bg-neutral-300': selected,
      })}
      onClick={onClick}
    >
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-sm bg-neutral-300">
        <UserGroupIconSolid className="h-5 text-sm text-gray-400" />
      </div>
      <div className="ml-3 truncate">
        {chunks.map((chunk, i) => {
          const str = name!.substring(chunk.start, chunk.end);
          return (
            <span
              key={i}
              className={clsx('inline-block', {
                'text-green-500': chunk.highlight,
              })}
            >
              {str}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function SearchFriendEntry({
  selected,
  onClick,
  sortInfo,
}: {
  selected: boolean;
  onClick: () => void;
  sortInfo: {
    user: UserInfo;
    chunks: Chunk[];
    isNickname: boolean;
  };
}) {
  const { user, chunks, isNickname } = sortInfo;
  const { nickname, username } = user;
  return (
    <div
      className={clsx('flex h-14 items-center px-3 hover:bg-neutral-300', {
        'bg-neutral-300': selected,
      })}
      onClick={onClick}
    >
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-sm bg-neutral-300">
        <UserIconSolid className="h-5 truncate text-ellipsis text-sm text-gray-400" />
      </div>
      {isNickname ? (
        <div className="ml-3 truncate">
          {chunks.map((chunk, i) => {
            const str = nickname.substring(chunk.start, chunk.end);
            return (
              <span
                key={i}
                className={clsx('inline-block', {
                  'text-green-500': chunk.highlight,
                })}
              >
                {str}
              </span>
            );
          })}
        </div>
      ) : (
        <div className="ml-3 flex w-full flex-col justify-between truncate">
          <div className="w-full truncate">{nickname}</div>
          <div className="truncate">
            <span className="inline-block text-sm text-neutral-500">
              username:&nbsp;
            </span>
            {chunks.map((chunk, i) => {
              const str = username.substring(chunk.start, chunk.end);
              return (
                <span
                  key={i}
                  className={clsx('inline-block text-sm', {
                    'text-green-500': chunk.highlight,
                  })}
                >
                  {str}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
