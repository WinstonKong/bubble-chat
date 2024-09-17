import { ChannelInfo, UserInfo } from '@/app/lib/types';
import { DMChatInfo } from './private-chat-info';
import { GroupChatInfo } from './group-chat-info';
import { createContext, useContext } from 'react';

type ChatInfoType = {
  channel: ChannelInfo;
  title: string;
  isDM: boolean;
  dmUser?: UserInfo | undefined;
  setSelectUserID: (uid: string | undefined) => void;
  setShowLeaving: (showLeaving: boolean) => void;
};

const ChatContext = createContext<ChatInfoType>(null as any);

export function useChatInfo() {
  return useContext(ChatContext);
}

export function ChatInfo(info: ChatInfoType) {
  return (
    <ChatContext.Provider value={info}>
      {info.isDM ? <DMChatInfo /> : <GroupChatInfo />}
    </ChatContext.Provider>
  );
}
