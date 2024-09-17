import {
  Channel,
  FriendRequest,
  type Message,
  type User,
} from '@prisma/client';

export enum SocketStatus {
  uninitialized = 'uninitialized',
  initialized = 'initialized',
  connected = 'connected',
  disconnected = 'disconnected',
}

export type PrivateMessage = {
  message_id: number;
  from: string;
  to: string;
  content: string;
  created_at: number;
};

export type UserCreateInfo = {
  username: string;
  nickname: string;
  password: string;
  bio: string;
};

export type PrivateUser = Omit<User, 'password'> & {
  friends?: PrivateUser[];
  friendsOf?: PrivateUser[];
  channels?: Channel[];
};

export enum MessageSendStatus {
  sending,
  sent,
  failed,
}

export type ChannelReadInfo = Record<string, number>; // cid: messageID
export type ChannelUnreadInfo = Record<string, number>; // cid: count

export type ChannelInfo = Channel;
export type ChannelsInfo = Record<string, ChannelInfo | undefined | null>;
export type ChannelWithMessage = ChannelInfo & { messages: MessageInfo[] };

export type UserInfo = Omit<User, 'password'>;
export type UsersInfo = Record<string, UserInfo>;
export type FriendRequestInfo = FriendRequest & {
  sender?: UserInfo,
  receiver?: UserInfo,
}
export type FriendRequests = Record<string, FriendRequestInfo>;

export type UserInfoAndChannels = UserInfo & { channels?: Channel[] };

export type MessageInfo = Message & { user: UserInfo } & {
  sendStatus?: MessageSendStatus;
};
export type MessagesInfo = Record<string, MessageInfo>;
export type ChannelFirstMessages = Record<string, string | false>;
export type SelfAndUsers = {
  self: UserInfo,
  users: UsersInfo
}
export type ChannelsAndMessages = {channels?: ChannelsInfo, messages?: MessagesInfo}