import {
  ChannelReadInfo,
  ChannelUnreadInfo,
  MessageInfo,
  MessagesInfo,
} from '@/app/lib/types';
import { BubbleContextType } from '../bubble/provider';
import { Message, MessageType } from '@prisma/client';
import { Logger } from '@/app/lib/utils';

export function getLocalChannelReadInfo(uid: string): ChannelReadInfo {
  const localCache = localStorage.getItem(uid);
  if (!localCache) {
    return {};
  }
  try {
    const cache: ChannelReadInfo = JSON.parse(localCache);
    return cache;
  } catch (e) {
    Logger.error('parse local cache error', e);
    return {};
  }
}

export function updateLocalChannelReadInfo(data: ChannelReadInfo, uid: string) {
  try {
    localStorage.setItem(uid, JSON.stringify(data));
  } catch (e) {
    Logger.error('set local cache error', e);
  }
}

export function mergeMessageToReadInfo(
  uid: string,
  messages: MessagesInfo | undefined,
  localInfo: {
    localReadInfo: ChannelReadInfo;
    localUnreadInfo?: ChannelUnreadInfo;
  },
) {
  if (!!messages) {
    const { localReadInfo, localUnreadInfo } = localInfo;
    const channelWithMessages = Object.values(messages).reduce(
      (prev: Record<string, MessageInfo[]>, curr) => {
        if (prev[curr.channelID]) {
          prev[curr.channelID].push(curr);
        } else {
          prev[curr.channelID] = [curr];
        }
        return prev;
      },
      {},
    );
    const updatedReadInfo = Object.entries(channelWithMessages)
      .map(([channelID, messageSet]) => {
        const messages = messageSet.sort((a, b) => b.messageID - a.messageID);
        const info = getReadInfo(uid, channelID, messages, localReadInfo);
        const { unreadCount, readMessageID } = info;
        const localUnreadCount = localUnreadInfo?.[channelID] ?? 0;
        return {
          channelID: channelID,
          unreadCount: unreadCount + localUnreadCount,
          readMessageID: readMessageID,
        };
      })
      .reduce(
        (
          acc: {
            localReadInfo: ChannelReadInfo;
            localUnreadInfo: ChannelUnreadInfo;
          },
          curr,
        ) => {
          const { channelID, unreadCount, readMessageID } = curr;
          if (typeof readMessageID === 'number') {
            acc.localReadInfo[channelID] = readMessageID;
          }
          acc.localUnreadInfo[channelID] = unreadCount;
          return acc;
        },
        {
          localReadInfo: {},
          localUnreadInfo: {},
        },
      );
    return updatedReadInfo;
  }
  return undefined;
}

function getReadInfo(
  uid: string,
  channelID: string,
  sortedMessages: Message[],
  localReadInfo: Record<string, number>,
) {
  if (
    sortedMessages.length > 0 &&
    sortedMessages[sortedMessages.length - 1].messageType ===
      MessageType.ChannelStart
  ) {
    sortedMessages.pop();
  }

  const localReadMessageID = localReadInfo[channelID];
  const localReadIndex =
    typeof localReadMessageID !== 'number'
      ? -1
      : sortedMessages.findIndex((m) => m.messageID === localReadMessageID);

  const userSendMessageIndex = sortedMessages.findIndex(
    (m) => m.userID === uid,
  );
  const messageCountAfterUserSend =
    userSendMessageIndex === -1 ? sortedMessages.length : userSendMessageIndex;
  const messageCountAfterLocalRead =
    localReadIndex === -1 ? sortedMessages.length : localReadIndex;

  return {
    unreadCount: Math.min(
      messageCountAfterUserSend,
      messageCountAfterLocalRead,
    ),
    readMessageID:
      messageCountAfterUserSend < messageCountAfterLocalRead
        ? sortedMessages[userSendMessageIndex]?.messageID
        : localReadMessageID,
  };
}

export function updateContextWithReadInfo(
  bubbleContext: BubbleContextType,
  action: Partial<BubbleContextType>,
  contextUpdater: (
    context: BubbleContextType,
    action: Partial<BubbleContextType>,
  ) => Partial<BubbleContextType>,
) {
  const { localReadInfo: updateReadInfo, localUnreadInfo } = action;
  const updatedLocalInfo: {
    localReadInfo?: ChannelReadInfo;
    localUnreadInfo?: ChannelUnreadInfo;
  } = {};

  updatedLocalInfo.localUnreadInfo = {
    ...bubbleContext.localUnreadInfo,
    ...localUnreadInfo,
  };

  if (
    updateReadInfo !== undefined &&
    Object.keys(updateReadInfo).find(
      (id) => updateReadInfo[id] !== bubbleContext.localReadInfo[id],
    )
  ) {
    const localReadInfo = {
      ...bubbleContext.localReadInfo,
      ...updateReadInfo,
    };
    updateLocalChannelReadInfo(localReadInfo, bubbleContext.uid);
    updatedLocalInfo.localReadInfo = localReadInfo;
  }

  return {
    ...bubbleContext,
    ...updatedLocalInfo,
    ...contextUpdater(bubbleContext, action),
  };
}
