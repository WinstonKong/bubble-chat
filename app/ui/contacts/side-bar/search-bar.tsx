import { useSideBarContext, useSideBarDispatchContext } from './side-bar';
import { AddFriendBar } from './add-friend-bar';
import { SearchContactBar } from '../../search/search-contact-bar';
import { UserPlusIcon } from '@heroicons/react/24/outline';

export function SearchBar() {
  const { isSearchNewFriend } = useSideBarContext();

  if (isSearchNewFriend) {
    return <AddFriendBar />;
  }
  return (
    <SearchContactBar>
      <AddFriendButton />
    </SearchContactBar>
  );
}

function AddFriendButton() {
  const dispatch = useSideBarDispatchContext();

  return (
    <button
      className="mr-3 flex h-6 w-6 items-center justify-center rounded-sm bg-neutral-200 text-xs hover:bg-neutral-400"
      onClick={() => dispatch({ type: 'searchNewFriend' })}
    >
      <UserPlusIcon className="h-5 opacity-50" />
    </button>
  );
}
