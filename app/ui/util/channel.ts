import { Socket } from 'socket.io-client';
import { Dispatch, RefObject } from 'react';
import { Channel, ChannelType, MessageType } from '@prisma/client';
import { BubbleDispatchType } from '@/app/ui/bubble/provider';
import { redirectTo } from '@/app/lib/actions';
import { sendMessage } from '@/app/lib/socket';
import {
  ChannelsInfo,
  UsersInfo,
  UserInfo,
  ChannelInfo,
  MessageInfo,
  MessageSendStatus,
  MessagesInfo,
} from '@/app/lib/types';

export function isPrivateChannel(channel: ChannelInfo | Channel) {
  return channel.channelType === ChannelType.DirectMessage;
}

export function submitNewMessage(
  inputRef: RefObject<HTMLTextAreaElement>,
  uid: string,
  dispatchBubble: Dispatch<BubbleDispatchType>,
  channel?: ChannelInfo,
  io?: Socket | null,
) {
  if (!channel) {
    return;
  }
  inputRef.current?.focus();
  const content = inputRef.current?.value;
  if (content && content?.length > 0) {
    inputRef.current.value = '';
    const localMessage: MessageInfo = {
      id: Date.now() + Math.random() + '',
      content: content,
      sendStatus: MessageSendStatus.sending,
      createdAt: Date.now(),
      channelID: channel.id,
      userID: uid,
    } as any;
    dispatchBubble({
      type: 'upsertMessages',
      messages: { [localMessage.id]: localMessage },
    });
    sendMessage(localMessage, dispatchBubble, io);
  }
}

export function getDMUser(
  channel: ChannelInfo,
  users: UsersInfo | undefined,
  uid: string,
): UserInfo | undefined {
  if (isPrivateChannel(channel)) {
    const userID = channel.userIDs.find((id) => id !== uid);
    if (userID) {
      const user = users?.[userID];
      return user;
    }
  }
  return undefined;
}

export function getDMUid(channel: ChannelInfo, uid: string) {
  return channel.userIDs.find((id) => id !== uid);
}

export function getChannelMessages(
  channelID: string,
  messages: MessagesInfo | undefined,
  sort?: boolean,
) {
  const allMessages = messages
    ? Object.values(messages).filter((m) => m.channelID === channelID)
    : [];
  return sort ? allMessages.sort(sortMessages) : allMessages;
}

export function sortChannels(
  channels: ChannelsInfo | undefined,
  messages: MessagesInfo | undefined,
) {
  if (!channels) {
    return [];
  }
  const allMessages = messages ? Object.values(messages) : [];
  return Object.keys(channels)
    .filter((cid) => !!channels[cid])
    .map((cid) => {
      const channelMessages = allMessages
        .filter((m) => m.channelID === cid)
        .sort(sortMessages);
      return {
        ...channels[cid]!,
        messages: channelMessages,
      };
    })
    .sort((a, b) => {
      if (a.messages.length === 0) {
        return 1;
      }
      if (b.messages.length === 0) {
        return -1;
      }

      if (
        b.messages[0].messageID !== undefined &&
        a.messages[0].messageID !== undefined
      ) {
        return b.messages[0].messageID - a.messages[0].messageID;
      }
      return b.messages[0].createdAt - a.messages[0].createdAt;
    });
}

function sortMessages(a: MessageInfo, b: MessageInfo) {
  if (b.messageID !== undefined && a.messageID !== undefined) {
    return b.messageID - a.messageID;
  }
  return b.createdAt - a.createdAt;
}

export function getDMID(userAID: string, userBID: string) {
  return userAID > userBID ? `${userAID}_${userBID}` : `${userBID}_${userAID}`;
}

export function chatWithUser(
  userID: string,
  currentUserID: string,
  channels: ChannelsInfo | undefined,
  dispatchBubble: Dispatch<BubbleDispatchType>,
) {
  const dmID = getDMID(currentUserID, userID);
  const channel =
    channels && Object.values(channels).find((c) => c && c.dmID === dmID);
  if (channel) {
    chatToChannel(channel.id, dispatchBubble);
  }
}

export function chatToChannel(
  channelID: string,
  dispatchBubble: Dispatch<BubbleDispatchType>,
) {
  redirectTo('/bubble/chats');
  dispatchBubble({
    type: 'openChannel',
    openChannelID: channelID,
  });
}

export function getDefaultGroupName(users: UserInfo[]) {
  if (users.length <= 5) {
    return users.map((u) => u.nickname).join(', ');
  }
  return (
    users
      .slice(0, 5)
      .map((u) => u.nickname)
      .join(', ') + '...'
  );
}

export function isPrivateChannelWithStranger(
  user: UserInfo,
  channel: ChannelInfo,
) {
  if (isPrivateChannel(channel)) {
    const friendIDs = new Set([
      user.id,
      ...user.friendIDs,
      ...user.friendOfIDs,
    ]);
    const memberIDs = channel.userIDs;
    const notFriendID = !!memberIDs.find((uid) => !friendIDs.has(uid));
    return !notFriendID;
  }
  return true;
}

export function isSystemMessage(message: MessageInfo | undefined) {
  if (!message) {
    return false;
  }
  const messageType = message.messageType;
  return (
    messageType === MessageType.ChannelStart ||
    messageType === MessageType.AddFriend ||
    messageType === MessageType.JoinChannel
  );
}

export function getSystemMessage(message: MessageInfo) {
  const { messageType } = message;
  switch (messageType) {
    case 'JoinChannel':
      return `${message.user?.nickname ?? ''} joind group chat.`;
    case 'AddFriend':
      return 'You are already friends.';
    default:
      return '';
  }
}
