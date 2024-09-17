import { useEffect, useMemo } from 'react';
import { useBubble, useBubbleDispatch } from '../bubble/provider';
import { fetchUserFriend } from '@/app/lib/socket';
import { getFriends, sortFriendsByAlphabet } from '../util';

export function useSortFriends() {
  const { user, users, io, uid } = useBubble();
  const dispatchBubble = useBubbleDispatch();
  useEffect(() => {
    if (!user) {
      return;
    }
    const notFoundFriend =
      user.friendIDs.find((id) => !users?.[id]) ||
      user.friendOfIDs.find((id) => !users?.[id]);
    if (notFoundFriend) {
      fetchUserFriend(uid, dispatchBubble, io);
    }
  }, [user, users, uid, dispatchBubble, io]);

  const sortedFriends = useMemo(() => {
    return sortFriendsByAlphabet(getFriends(user, users));
  }, [user, users]);
  return sortedFriends;
}
