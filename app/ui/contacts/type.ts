import { ChannelInfo, UserInfo } from "@/app/lib/types";

export type ContactsUIState = {
  showFriendRequests?: boolean;
  selectedUser?: UserInfo;
  selectedGroup?: ChannelInfo;
};
