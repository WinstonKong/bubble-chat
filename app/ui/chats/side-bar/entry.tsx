'use client';

import {
  UserGroupIcon as UserGroupIconSolid,
  UserIcon,
} from '@heroicons/react/24/solid';
import clsx from 'clsx';
import { forwardRef, useEffect, useMemo, useRef } from 'react';
import { useBubble, useBubbleDispatch } from '../../bubble/provider';
import { ChannelWithMessage, MessageInfo } from '@/app/lib/types';
import {
  getDMUid,
  getDMUser,
  isPrivateChannel,
  sortChannels,
  getDateOrTime,
  isSystemMessage,
  getSystemMessage,
} from '../../util';
import { ChannelTableSkeleton } from '../skeleton';
import { fetchUser } from '@/app/lib/socket';
import { UnreadCount } from '../../component/unread';

export function ChannelEntries() {
  return (
    <div className="scrollbar-track-bg-neutral-200 flex h-full w-full flex-col overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-neutral-300">
      <ChannelsTable />
    </div>
  );
}

function ChannelsTable() {
  const entryRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const { channels, messages, openChannelID } = useBubble();
  const sortedChannels = sortChannels(channels, messages);

  useEffect(() => {
    if (!!openChannelID) {
      requestAnimationFrame(() => {
        entryRefs.current[openChannelID]?.scrollIntoView({ block: 'nearest' });
      });
    }
  }, [openChannelID]);

  if (sortedChannels.length === 0) {
    return <ChannelTableSkeleton />;
  }

  return (
    <div className="flex w-full flex-col">
      {sortedChannels.map((channel) => (
        <ChannelEntry
          ref={(node) => {
            entryRefs.current[channel.id] = node;
          }}
          key={channel.id}
          channel={channel}
        />
      ))}
    </div>
  );
}

const ChannelEntry = forwardRef(function ChannelEntry(
  { channel }: { channel: ChannelWithMessage },
  ref: React.Ref<HTMLDivElement>,
) {
  const { uid, openChannelID, users, io, localUnreadInfo } = useBubble();
  const dispatchBubble = useBubbleDispatch();
  const isDM = isPrivateChannel(channel);
  const dmUser = useMemo(() => {
    return getDMUser(channel, users, uid);
  }, [channel, users, uid]);
  useEffect(() => {
    if (isDM && !dmUser) {
      fetchUser(getDMUid(channel, uid), undefined, dispatchBubble, io);
    }
  }, [channel, dispatchBubble, dmUser, io, isDM, uid]);

  const lastMessage: MessageInfo | undefined = channel.messages[0];
  const isFromSystem = isSystemMessage(lastMessage);
  const unreadCount =
    lastMessage === undefined ? undefined : localUnreadInfo?.[channel.id];
  const channelName = isDM ? dmUser?.nickname ?? '' : channel.name;
  const lastMessageContent = isFromSystem
    ? getSystemMessage(lastMessage)
    : lastMessage?.content ?? '';
  const lastMessageTime = lastMessage
    ? getDateOrTime(lastMessage.createdAt)
    : '';
  const lastMessageSenderName =
    lastMessage && !isDM && lastMessage.userID !== uid && !isFromSystem
      ? lastMessage.user.nickname + ': '
      : '';
  return (
    <div
      ref={ref}
      className={clsx(
        'flex h-14 w-full items-center px-3 hover:bg-neutral-300',
        {
          'bg-neutral-300': openChannelID === channel.id,
        },
      )}
      onClick={() =>
        dispatchBubble({
          type: 'openChannel',
          openChannelID: channel.id,
        })
      }
    >
      <div className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-sm bg-neutral-300">
        {isDM ? (
          <UserIcon className="h-5 text-sm text-gray-400" />
        ) : (
          <UserGroupIconSolid className="h-5 text-sm text-gray-400" />
        )}
        <UnreadCount count={unreadCount} />
      </div>
      <div className="ml-3 flex w-full flex-col justify-between truncate">
        <div className="flex w-full justify-between ">
          <div className="w-full truncate ">{channelName}</div>
          <div className="ml-2 text-xs text-neutral-500">{lastMessageTime}</div>
        </div>
        <div className="truncate text-xs text-neutral-500">
          {lastMessageSenderName}
          {lastMessageContent}
        </div>
      </div>
    </div>
  );
});
