import { io, Socket } from 'socket.io-client';
import { Dispatch } from 'react';
import { FriendRequestStatus } from '@prisma/client';
import {
  BubbleContextType,
  BubbleDispatchType,
} from '@/app/ui/bubble/provider';
import {
  UsersInfo,
  SocketStatus,
  ChannelsInfo,
  MessageInfo,
  UserInfoAndChannels,
  UserInfo,
  FriendRequests,
  MessagesInfo,
  MessageSendStatus,
  ChannelUnreadInfo,
  SelfAndUsers,
  ChannelsAndMessages,
} from '@/app/lib/types';
import { Logger } from './utils';

function onConnectSuccess(
  socket: Socket,
  context: BubbleContextType,
  dispatch: Dispatch<BubbleDispatchType>,
) {
  socket.on('connect', () => {
    Logger.log('socket connected', socket.id);
    socket.emit('join', context.uid, context.localReadInfo);
    dispatch({
      type: 'updateIO',
      socketStatus: SocketStatus.connected,
    });
  });
}

function onConnectFailed(
  socket: Socket,
  dispatch: Dispatch<BubbleDispatchType>,
) {
  ['connect_error', 'disconnect', 'reconnect_failed'].forEach((e) => {
    socket.on(e, () => {
      Logger.error('socket connect failed', e);
      dispatch({
        type: 'updateIO',
        socketStatus: SocketStatus.disconnected,
      });
    });
  });
}

function onUserInfo(socket: Socket, dispatch: Dispatch<BubbleDispatchType>) {
  socket.on(
    'userInfo',
    (response: { ok: boolean; data?: UserInfoAndChannels }) => {
      const { ok, data } = response;
      if (!ok || !data) {
        dispatch({
          type: 'initLoad',
          initLoadStatus: 'failed',
        });
      } else {
        const channels = data.channels?.reduce((prev: ChannelsInfo, curr) => {
          prev[curr.id] = curr;
          return prev;
        }, {});
        delete data.channels;
        dispatch({
          type: 'initLoad',
          initLoadStatus: 'ok',
          user: data,
          channels: channels,
        });
      }
    },
  );
}

function onFriends(socket: Socket, dispatch: Dispatch<BubbleDispatchType>) {
  socket.on('friends', ({ data }: { data: SelfAndUsers }) => {
    dispatch({
      type: 'updateSelfAndUsers',
      user: data.self,
      users: data.users,
    });
  });
}

function onSelf(socket: Socket, dispatch: Dispatch<BubbleDispatchType>) {
  socket.on('self', ({ data }: { data: UserInfo }) => {
    dispatch({
      type: 'updateSelf',
      user: data,
    });
  });
}

function onFriendRequests(
  socket: Socket,
  dispatch: Dispatch<BubbleDispatchType>,
) {
  socket.on('friendRequests', ({ data }: { data: FriendRequests }) => {
    dispatch({
      type: 'updateFriendRequests',
      friendRequests: data,
    });
  });
}

function onAcceptedFriendRequest(
  socket: Socket,
  dispatch: Dispatch<BubbleDispatchType>,
) {
  socket.on(
    'acceptedFriendRequest',
    ({
      data,
    }: {
      data: {
        user?: UserInfo;
        channels?: ChannelsInfo;
        users?: UsersInfo;
        messages?: MessagesInfo;
        friendRequests: FriendRequests;
      };
    }) => {
      dispatch({
        type: 'acceptedFriendRequest',
        user: data?.user,
        channels: data?.channels,
        users: data?.users,
        messages: data?.messages,
        friendRequests: data?.friendRequests,
      });
    },
  );
}

function onMessages(socket: Socket, dispatch: Dispatch<BubbleDispatchType>) {
  socket.on('messages', ({ data }: { data: MessagesInfo }) => {
    dispatch({
      type: 'upsertMessages',
      messages: data,
    });
  });
}

function onNewMessage(
  socket: Socket,
  uid: string,
  dispatch: Dispatch<BubbleDispatchType>,
) {
  socket.on('newMessage', ({ data }: { data: MessageInfo }) => {
    dispatch({
      type: 'upsertMessages',
      messages: { [data.id]: data },
    });
    if (data.userID !== uid) {
      dispatch({
        type: 'increaseUnreadCount',
        localUnreadInfo: { [data.channelID]: 1 },
      });
    }
  });
}

function onUpdateChannels(
  socket: Socket,
  dispatch: Dispatch<BubbleDispatchType>,
) {
  socket.on('updateChannels', ({ data }: { data: ChannelsAndMessages }) => {
    dispatch({
      type: 'updateChannels',
      channels: data.channels,
      messages: data.messages,
    });
  });
}

function onChannelUnreadInfo(
  socket: Socket,
  dispatch: Dispatch<BubbleDispatchType>,
) {
  socket.on('channelUnread', ({ data }: { data: ChannelUnreadInfo }) => {
    dispatch({
      type: 'updateMessageReadInfo',
      localUnreadInfo: data,
    });
  });
}

export function initializeSocket(
  context: BubbleContextType,
  dispatch: Dispatch<BubbleDispatchType>,
) {
  const socket = io(process.env.NEXT_PUBLIC_CHAT_SERVER!, {
    reconnectionAttempts: 1,
  });

  dispatch({
    type: 'updateIO',
    io: socket,
    socketStatus: SocketStatus.initialized,
  });

  onConnectSuccess(socket, context, dispatch);
  onConnectFailed(socket, dispatch);

  onUserInfo(socket, dispatch);
  onMessages(socket, dispatch);
  onSelf(socket, dispatch);
  onFriends(socket, dispatch);
  onFriendRequests(socket, dispatch);
  onNewMessage(socket, context.uid, dispatch);
  onChannelUnreadInfo(socket, dispatch);
  onAcceptedFriendRequest(socket, dispatch);
  onUpdateChannels(socket, dispatch);

  return socket;
}

export function fetchUser(
  uid: string | undefined,
  username: string | undefined,
  dispatchBubble: Dispatch<BubbleDispatchType>,
  io?: Socket | null,
  callback?: (ok: boolean, data?: UserInfo) => void,
) {
  if (uid === undefined && username === undefined) {
    Logger.error('invalid uid and username');
    return;
  }
  io?.emit(
    'fetchUser',
    uid,
    username,
    (response: { ok: boolean; data: UserInfo }) => {
      const { ok, data } = response;
      if (!ok) {
        Logger.error('fetch user failed', uid);
      } else {
        dispatchBubble({
          type: 'updateUsers',
          users: { [data.id]: data },
        });
      }
      callback?.(ok, data);
    },
  );
}

export function fetchUserFriend(
  uid: string,
  dispatchBubble: Dispatch<BubbleDispatchType>,
  io?: Socket | null,
  callback?: (ok: boolean, data: SelfAndUsers) => void,
) {
  io?.emit(
    'fetchFriends',
    uid,
    ({ ok, data }: { ok: boolean; data: SelfAndUsers }) => {
      if (!ok) {
        Logger.error('fetchFriends failed', uid);
      } else {
        dispatchBubble({
          type: 'updateSelfAndUsers',
          user: data.self,
          users: data.users,
        });
      }
      callback?.(ok, data);
    },
  );
}

export function fetchMessages(
  channelID: string,
  lastMessageID: number | undefined,
  dispatchBubble: Dispatch<BubbleDispatchType>,
  io?: Socket | null,
  callback?: (ok: boolean, data: MessagesInfo) => void,
) {
  io?.emit(
    'fetchMessages',
    channelID,
    lastMessageID,
    ({ ok, data }: { ok: boolean; data: MessagesInfo }) => {
      if (!ok) {
        Logger.error('fetchMessages failed', channelID);
      } else {
        dispatchBubble({
          type: 'upsertMessages',
          messages: data,
        });
      }
      callback?.(ok, data);
    },
  );
}

export function sendFriendRequest(
  request: {
    senderID: string;
    receiverID: string;
    message: string;
  },
  dispatchBubble: Dispatch<BubbleDispatchType>,
  io?: Socket | null,
  callback?: (ok: boolean, data?: FriendRequests) => void,
) {
  io?.emit(
    'sendFriendRequest',
    request,
    ({ ok, data }: { ok: boolean; data?: FriendRequests }) => {
      if (!ok) {
        Logger.error('sendFriendRequest failed', request);
      } else {
        dispatchBubble({
          type: 'updateFriendRequests',
          friendRequests: data,
        });
      }
      callback?.(ok, data);
    },
  );
}

export function updateFriendRequest(
  request: {
    id: string;
    senderID: string;
    receiverID: string;
    status: FriendRequestStatus;
  },
  dispatchBubble: Dispatch<BubbleDispatchType>,
  io?: Socket | null,
  callback?: (
    ok: boolean,
    data?: {
      user?: UserInfo;
      channels?: ChannelsInfo;
      users?: UsersInfo;
      messages?: MessagesInfo;
      friendRequests: FriendRequests;
    },
  ) => void,
) {
  io?.emit(
    'updateFriendRequest',
    request,
    ({
      ok,
      data,
    }: {
      ok: boolean;
      data?: {
        user?: UserInfo;
        channels?: ChannelsInfo;
        users?: UsersInfo;
        messages?: MessagesInfo;
        friendRequests: FriendRequests;
      };
    }) => {
      if (!ok) {
        Logger.error('updateFriendRequest failed', request);
      } else {
        if (request.status === FriendRequestStatus.Accepted) {
          dispatchBubble({
            type: 'acceptedFriendRequest',
            user: data?.user,
            channels: data?.channels,
            users: data?.users,
            messages: data?.messages,
            friendRequests: data?.friendRequests,
          });
        } else {
          dispatchBubble({
            type: 'updateFriendRequests',
            friendRequests: data?.friendRequests,
          });
        }
      }
      callback?.(ok, data);
    },
  );
}

export function createChannel(
  request: { createrID: string; otherUIDs: string[]; channelName: string },
  dispatchBubble: Dispatch<BubbleDispatchType>,
  io?: Socket | null,
  callback?: (ok: boolean, data?: ChannelsAndMessages) => void,
) {
  io?.emit(
    'createChannel',
    request,
    ({ ok, data }: { ok: boolean; data?: ChannelsAndMessages }) => {
      if (!ok) {
        Logger.error('createChannel failed', request);
      } else {
        dispatchBubble({
          type: 'updateChannels',
          channels: data?.channels,
          messages: data?.messages,
        });
      }
      callback?.(ok, data);
    },
  );
}

export function addUsersToChannel(
  request: { uid: string; channelID: string; uids: string[] },
  dispatchBubble: Dispatch<BubbleDispatchType>,
  io?: Socket | null,
  callback?: (ok: boolean, data?: ChannelsAndMessages) => void,
) {
  updateChannelInfo('addUsersToChannel', request, dispatchBubble, io, callback);
}

export function updateChannelName(
  request: {
    uid: string;
    channelID: string;
    newName: string;
  },
  dispatchBubble: Dispatch<BubbleDispatchType>,
  io?: Socket | null,
  callback?: (ok: boolean, data?: ChannelsAndMessages) => void,
) {
  updateChannelInfo('updateChannelName', request, dispatchBubble, io, callback);
}

export function leaveChannel(
  request: {
    uid: string;
    channelID: string;
  },
  dispatchBubble: Dispatch<BubbleDispatchType>,
  io?: Socket | null,
  callback?: (ok: boolean, data?: ChannelsAndMessages) => void,
) {
  updateChannelInfo('leaveChannel', request, dispatchBubble, io, callback);
}

function updateChannelInfo<T>(
  method: string,
  requestData: T,
  dispatchBubble: Dispatch<BubbleDispatchType>,
  io?: Socket | null,
  callback?: (ok: boolean, data?: ChannelsAndMessages) => void,
) {
  io?.emit(
    method,
    requestData,
    ({ ok, data }: { ok: boolean; data?: ChannelsAndMessages }) => {
      if (!ok) {
        Logger.error(`updateChannelInfo: ${method} failed`, requestData);
      } else {
        dispatchBubble({
          type: 'updateChannels',
          channels: data?.channels,
          messages: data?.messages,
        });
      }
      callback?.(ok, data);
    },
  );
}

export function updateBio(
  request: { uid: string; bio: string },
  dispatchBubble: Dispatch<BubbleDispatchType>,
  io?: Socket | null,
  callback?: (ok: boolean, data?: UserInfo) => void,
) {
  updateProfile('updateBio', request, dispatchBubble, io, callback);
}

export function updateNickname(
  request: { uid: string; nickname: string },
  dispatchBubble: Dispatch<BubbleDispatchType>,
  io?: Socket | null,
  callback?: (ok: boolean, data?: UserInfo) => void,
) {
  updateProfile('updateNickname', request, dispatchBubble, io, callback);
}

export function updateProfile<T>(
  method: string,
  requestData: T,
  dispatchBubble: Dispatch<BubbleDispatchType>,
  io?: Socket | null,
  callback?: (ok: boolean, data?: UserInfo) => void,
) {
  io?.emit(
    method,
    requestData,
    ({ ok, data }: { ok: boolean; data?: UserInfo }) => {
      if (!ok) {
        Logger.error(`updateProfile: ${method} failed`, requestData);
      } else {
        dispatchBubble({
          type: 'updateSelf',
          user: data,
        });
      }
      callback?.(ok, data);
    },
  );
}

export function sendMessage(
  message: MessageInfo,
  dispatchBubble: Dispatch<BubbleDispatchType>,
  io?: Socket | null,
) {
  io?.emit(
    'userSendMessage',
    message.userID,
    message.channelID,
    message.content,
    (response: { ok: boolean; data: MessageInfo }) => {
      const { ok, data } = response;

      const localMessage = {
        ...message,
        sendStatus: ok ? MessageSendStatus.sent : MessageSendStatus.failed,
      };
      const upsertMessages = {
        [localMessage.id]: localMessage,
        ...(data ? { [data.id]: data } : {}),
      };
      dispatchBubble({
        type: 'upsertMessages',
        messages: upsertMessages,
      });
    },
  );
}

export function deleteFriend(
  request: {
    uid: string;
    friendUID: string;
  },
  dispatchBubble: Dispatch<BubbleDispatchType>,
  io?: Socket | null,
  callback?: (ok: boolean, data?: SelfAndUsers) => void,
) {
  io?.emit(
    'deleteFriend',
    request,
    ({ ok, data }: { ok: boolean; data?: SelfAndUsers }) => {
      if (!ok) {
        Logger.error('deleteFriend failed', request);
      } else {
        if (data) {
          dispatchBubble({
            type: 'updateSelfAndUsers',
            user: data.self,
            users: data.users,
          });
        }
      }
      callback?.(ok, data);
    },
  );
}
