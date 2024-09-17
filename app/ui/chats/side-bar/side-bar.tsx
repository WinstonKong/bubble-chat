import { SearchBar } from './search-bar';
import {
  SearchContactProvider,
  useSearchContact,
} from '../../search/search-contact-provider';
import { SearchFriendTable } from '../../search/search-contact-entry';
import { ChannelEntries } from './entry';
import { useChat } from '../provider';
import { noFunc } from '../../util';

function SearchContactPanel() {
  const { isSearching } = useSearchContact();
  const { createNewGroup } = useChat();
  return isSearching && !createNewGroup?.creating ? (
    <SearchFriendTable />
  ) : (
    <ChannelEntries />
  );
}

export function SideBarPanel() {
  return (
    <SearchContactProvider onCancel={noFunc} exitAfterEnter={true}>
      <SearchBar />
      <SearchContactPanel />
    </SearchContactProvider>
  );
}
