import {
  createContext,
  useReducer,
  Dispatch,
  useContext,
  useCallback,
} from 'react';
import { SearchBar } from './search-bar';
import { ContactsEntries } from './entry';
import {
  SearchContactProvider,
  useSearchContact,
} from '../../search/search-contact-provider';
import { SearchFriendTable } from '../../search/search-contact-entry';
import { AddFriendProvider } from './add-friend-provider';
import { AddFriendTable } from './add-friend-entry';

type SideBarContextType = {
  isSearchingContacts?: boolean;
  isSearchNewFriend?: boolean;
};

type SideBarDispatchType = {
  type: 'searchContacts' | 'searchNewFriend' | 'reset';
} & Partial<SideBarContextType>;

const SideBarContext = createContext<SideBarContextType>(null as any);
const SideBarDispatchContext = createContext<Dispatch<SideBarDispatchType>>(
  null as any,
);

export function useSideBarContext() {
  return useContext(SideBarContext);
}

export function useSideBarDispatchContext() {
  return useContext(SideBarDispatchContext);
}

function sideBarReducer(
  context: SideBarContextType,
  action: SideBarDispatchType,
): SideBarContextType {
  switch (action.type) {
    case 'searchContacts':
      return {
        isSearchingContacts: true,
      };
    case 'searchNewFriend':
      return {
        isSearchNewFriend: true,
      };
    case 'reset':
      return {};
    default:
      throw Error(`Unkown action type: ${action}`);
  }
}

function SideBarProvider({ children }: { children: React.ReactNode }) {
  const [context, dispatch] = useReducer(sideBarReducer, {});

  return (
    <SideBarContext.Provider value={context}>
      <SideBarDispatchContext.Provider value={dispatch}>
        {children}
      </SideBarDispatchContext.Provider>
    </SideBarContext.Provider>
  );
}

function SideBar() {
  const { isSearchNewFriend } = useSideBarContext();
  const dispatch = useSideBarDispatchContext();
  const reset = useCallback(() => {
    dispatch({ type: 'reset' });
  }, [dispatch]);

  if (isSearchNewFriend) {
    return (
      <AddFriendProvider onCancel={reset}>
        <SearchBar />
        <AddFriendTable />
      </AddFriendProvider>
    );
  }

  return (
    <SearchContactProvider onCancel={reset} exitAfterEnter={false}>
      <SearchBar />
      <SearchContactPanel />
    </SearchContactProvider>
  );
}

function SearchContactPanel() {
  const { isSearching } = useSearchContact();
  return isSearching ? <SearchFriendTable /> : <ContactsEntries />;
}

export function SideBarPanel() {
  return (
    <SideBarProvider>
      <SideBar />
    </SideBarProvider>
  );
}
