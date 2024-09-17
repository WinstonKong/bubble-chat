'use client';

import { LoadUserProfile } from './user';
import { useContact } from './provider';
import { GroupProfile } from './group';
import { useBubble } from '../bubble/provider';
import { isLoadingOrFailed } from '../util';
import { LoadingOrNetworkError } from '../component/network';
import { FriendRequestsTable } from './friend-request';

export function DetailPanel() {
  const { context } = useContact();
  const bubble = useBubble();

  if (isLoadingOrFailed(bubble)) {
    return <LoadingOrNetworkError />;
  }

  const {
    selectedUser,
    selectedGroup,
    showFriendRequests,
  } = context;
  if (selectedUser !== undefined) {
    return (
      <div className="flex h-full w-full justify-center overflow-y-auto pt-28">
        <LoadUserProfile userID={selectedUser.id} user={selectedUser} />
      </div>
    );
  }

  if (selectedGroup !== undefined) {
    return <GroupProfile group={selectedGroup} />;
  }

  if (showFriendRequests) {
    return <FriendRequestsTable />;
  }
  return <></>;
}
