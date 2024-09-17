import { SearchContactBar } from '../../search/search-contact-bar';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useChatDispatch } from '../provider';
import { useSearchContactDispatch } from '../../search/search-contact-provider';

export function SearchBar() {
  return (
    <SearchContactBar>
      <CreateGroupButton />
    </SearchContactBar>
  );
}

function CreateGroupButton() {
  const dispatchChat = useChatDispatch();
  const dispatchSearch = useSearchContactDispatch();

  return (
    <button
      className="mr-3 flex h-6 w-6 items-center justify-center rounded-sm bg-neutral-200 hover:bg-neutral-400"
      onClick={() => {
        dispatchSearch({ type: 'reset' });
        dispatchChat({ type: 'setCreateNewGroup', createNewGroup: {creating: true} });
      }}
    >
      <PlusIcon className="h-4 opacity-50" />
    </button>
  );
}
