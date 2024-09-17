import { ChannelType } from '@prisma/client';
import {
  ChannelsInfo,
  UsersInfo,
  UserInfo,
  FriendRequests,
  FriendRequestInfo,
  ChannelInfo,
} from '@/app/lib/types';

export function sortFriendsByAlphabet(friends: UserInfo[]) {
  const notAlphabet: UserInfo[] = [];
  const alphabet: Record<string, UserInfo[]> = {};
  friends
    .sort((a, b) => a.nickname.localeCompare(b.nickname))
    .forEach((user) => {
      const initial = user.nickname[0].toUpperCase();
      if (initial >= 'A' && initial <= 'Z') {
        if (alphabet[initial] === undefined) {
          alphabet[initial] = [user];
        } else {
          alphabet[initial].push(user);
        }
      } else {
        notAlphabet.push(user);
      }
    });
  if (notAlphabet.length > 0) {
    alphabet['#'] = notAlphabet;
  }
  return alphabet;
}

export function getFriendsInfo(userID: string, users?: UsersInfo | false) {
  if (!users) {
    return undefined;
  }
  return users[userID];
}

export function getFriends(user?: UserInfo, users?: UsersInfo) {
  if (!user || !users) {
    return [];
  }
  const friends = [...(user.friendIDs ?? []), ...(user.friendOfIDs ?? [])]
    .map((id) => users[id])
    .filter((u) => !!u);
  return friends;
}

export function getGroups(channels?: false | ChannelsInfo): ChannelInfo[] {
  if (!channels) {
    return [];
  }
  return Object.values(channels).filter(
    (c) => c && c.channelType === ChannelType.Group,
  ) as ChannelInfo[];
}

export function sortFriendRequests(
  friendRequests: FriendRequests,
): FriendRequestInfo[] {
  return Object.values(friendRequests).sort(
    (a, b) => b.createdAt - a.createdAt,
  );
}
