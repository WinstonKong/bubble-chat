import { SearchContactProvider } from '../../search/search-contact-provider';
import { noFunc } from '../../util';
import { useChat } from '../provider';
import { ContactPanel } from './contact';
import { CreateGroupProvider } from './create-group-provider';
import { SearchContact } from './search-contact-bar';
import { NewGroupContact } from './new-group';

export function CreateGroupPanel() {
  const { createNewGroup } = useChat();
  if (!createNewGroup?.creating) {
    return <></>;
  }

  return (
    <CreateGroupProvider>
      <CreateGroup />
    </CreateGroupProvider>
  );
}

function CreateGroup() {
  return (
    <div className="absolute flex h-full w-full items-center justify-center">
      <div className="flex bg-white shadow-md">
        <SearchContactProvider onCancel={noFunc} exitAfterEnter={false}>
          <div className="flex w-72 flex-col border-r border-neutral-300">
            <div className="flex h-12 w-full justify-center px-4 pb-2 pt-4">
              <SearchContact />
            </div>
            <div className="h-96 w-full">
              <ContactPanel />
            </div>
          </div>
        </SearchContactProvider>

        <div className="flex w-80 flex-col">
          <div className="h-12 w-full pb-2 pl-8 pt-4">Select Contact</div>
          <NewGroupContact />
        </div>
      </div>
    </div>
  );
}
