'use client';

import { UserInfo } from '@/app/lib/types';
import { createContext, Dispatch, useContext, useReducer } from 'react';

type ChatContextType = {
  createNewGroup?: {
    creating: boolean,
    dmUser?: UserInfo
    addToChannel?: {
      channelID: string,
      existedMembers: Set<string>
    }
  };
};
type ChatDispatchType = {
  type: 'setCreateNewGroup'
} & Partial<ChatContextType>;

const ChatContext = createContext<ChatContextType>(null as any);
const ChatDispatchContext = createContext<Dispatch<ChatDispatchType>>(
  null as any,
);

function chatDispatchReducer(
  context: ChatContextType,
  action: ChatDispatchType,
): ChatContextType {
  switch (action.type) {
    case 'setCreateNewGroup':
      return {
        ...context,
        createNewGroup: action.createNewGroup,
      };
    default:
      throw Error(`Unkonw chatDispatchReducer action: ${action}`);
  }
}

export function useChat() {
  return useContext(ChatContext);
}

export function useChatDispatch() {
  return useContext(ChatDispatchContext);
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [context, dispatch] = useReducer(chatDispatchReducer, {});

  return (
    <ChatContext.Provider value={context}>
      <ChatDispatchContext.Provider value={dispatch}>
        {children}
      </ChatDispatchContext.Provider>
    </ChatContext.Provider>
  );
}
