'use client';

import {
  createContext,
  Context,
  useEffect,
  useContext,
  useReducer,
  Dispatch,
} from 'react';
import { Socket } from 'socket.io-client';
import dynamic from 'next/dynamic';
import { initializeSocket } from '@/app/lib/socket';
import {
  ChannelReadInfo,
  ChannelsInfo,
  UsersInfo,
  SocketStatus,
  UserInfo,
  FriendRequests,
  MessagesInfo,
  ChannelUnreadInfo,
} from '@/app/lib/types';
import {
  getLocalChannelReadInfo,
  mergeMessageToReadInfo,
  updateContextWithReadInfo,
} from '../util/unread';

export type BubbleContextType = {
  uid: string;
  openChannelID?: string;
  localReadInfo: ChannelReadInfo;
  localUnreadInfo?: ChannelUnreadInfo;
  io?: Socket | null;
  socketStatus?: SocketStatus;
  initLoadStatus?: 'ok' | 'failed';
  user?: UserInfo;
  channels?: ChannelsInfo;
  users?: UsersInfo;
  messages?: MessagesInfo;
  friendRequests?: FriendRequests;
};

type BubbleActionType =
  | 'updateIO'
  | 'initLoad'
  | 'updateChannels'
  | 'updateFriendRequests'
  | 'updateSelfAndUsers'
  | 'updateUsers'
  | 'upsertMessages'
  | 'updateMessageReadInfo'
  | 'increaseUnreadCount'
  | 'acceptedFriendRequest'
  | 'updateSelf'
  | 'openChannel';

export type BubbleDispatchType = {
  type: BubbleActionType;
} & Partial<BubbleContextType>;

const BubbleContext: Context<BubbleContextType> = createContext(null as any);
const BubbleDispatchContext: Context<Dispatch<BubbleDispatchType>> =
  createContext(null as any);

export function useBubble() {
  return useContext(BubbleContext);
}

export function useBubbleDispatch() {
  return useContext(BubbleDispatchContext);
}

function bubbleReducer(
  bubbleContext: BubbleContextType,
  action: BubbleDispatchType,
): BubbleContextType {
  switch (action.type) {
    case 'increaseUnreadCount': {
      const unread = Object.keys(action.localUnreadInfo ?? {}).reduce(
        (prev: ChannelUnreadInfo, cid) => {
          prev[cid] = (bubbleContext.localUnreadInfo?.[cid] ?? 0) + 1;
          return prev;
        },
        {},
      );
      return {
        ...bubbleContext,
        localUnreadInfo: {
          ...bubbleContext.localUnreadInfo,
          ...unread,
        },
      };
    }
    case 'updateMessageReadInfo': {
      return updateContextWithReadInfo(
        bubbleContext,
        action,
        (bubbleContext, action) => ({}),
      );
    }
    case 'upsertMessages': {
      return {
        ...bubbleContext,
        messages: {
          ...bubbleContext.messages,
          ...action.messages,
        },
      };
    }
    case 'openChannel': {
      return {
        ...bubbleContext,
        openChannelID: action.openChannelID,
      };
    }
    case 'initLoad': {
      return {
        ...bubbleContext,
        initLoadStatus: action.initLoadStatus,
        user: action.user ?? bubbleContext.user,
        channels: { ...bubbleContext.channels, ...action.channels },
      };
    }
    case 'updateSelfAndUsers': {
      return {
        ...bubbleContext,
        user: action.user ?? bubbleContext.user,
        users: { ...bubbleContext.users, ...action.users },
      };
    }
    case 'updateSelf': {
      return {
        ...bubbleContext,
        user: action.user ?? bubbleContext.user,
      };
    }
    case 'updateUsers': {
      return {
        ...bubbleContext,
        users: { ...bubbleContext.users, ...action.users },
      };
    }
    case 'updateChannels': {
      const updatedReadInfo = mergeMessageToReadInfo(
        bubbleContext.uid,
        action.messages,
        bubbleContext,
      );
      if (!!updatedReadInfo) {
        action.localReadInfo = updatedReadInfo.localReadInfo;
        action.localUnreadInfo = updatedReadInfo.localUnreadInfo;
      }

      return updateContextWithReadInfo(
        bubbleContext,
        action,
        (bubbleContext, action) => {
          return {
            channels: { ...bubbleContext.channels, ...action.channels },
            messages: { ...bubbleContext.messages, ...action.messages },
          };
        },
      );
    }
    case 'updateFriendRequests': {
      return {
        ...bubbleContext,
        friendRequests: {
          ...bubbleContext.friendRequests,
          ...action.friendRequests,
        },
      };
    }
    case 'acceptedFriendRequest': {
      const updatedReadInfo = mergeMessageToReadInfo(
        bubbleContext.uid,
        action.messages,
        bubbleContext,
      );
      if (!!updatedReadInfo) {
        action.localReadInfo = updatedReadInfo.localReadInfo;
        action.localUnreadInfo = updatedReadInfo.localUnreadInfo;
      }

      return updateContextWithReadInfo(
        bubbleContext,
        action,
        (bubbleContext, action) => {
          return {
            user: action.user ?? bubbleContext.user,
            users: { ...bubbleContext.users, ...action.users },
            messages: { ...bubbleContext.messages, ...action.messages },
            channels: { ...bubbleContext.channels, ...action.channels },
            friendRequests: {
              ...bubbleContext.friendRequests,
              ...action.friendRequests,
            },
          };
        },
      );
    }
    case 'updateIO': {
      if (action.io) {
        return {
          ...bubbleContext,
          io: action.io,
          socketStatus: action.socketStatus,
        };
      } else {
        return {
          ...bubbleContext,
          socketStatus: action.socketStatus,
        };
      }
    }
    default: {
      throw Error('Unknown action: ' + action.type);
    }
  }
}

function BubbleProvider({
  children,
  uid,
}: {
  children: React.ReactNode;
  uid: string;
}) {
  const [context, dispatch] = useReducer(bubbleReducer, {
    uid: uid,
    localReadInfo: getLocalChannelReadInfo(uid),
  });

  useEffect(() => {
    const socket = initializeSocket(context, dispatch);
    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <BubbleContext.Provider value={context}>
      <BubbleDispatchContext.Provider value={dispatch}>
        {children}
      </BubbleDispatchContext.Provider>
    </BubbleContext.Provider>
  );
}

export default dynamic(() => Promise.resolve(BubbleProvider), {
  ssr: false,
});
