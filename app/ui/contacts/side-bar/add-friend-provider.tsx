import { createContext, Dispatch, useContext, useReducer } from 'react';

type AddFriendType = {
  onCancel: () => void;
  searchText?: string;
  isSearching?: boolean;
};

type AddFriendDispatchType = {
  type: 'updateSearchText' | 'setIsSearching' | 'reset';
} & Partial<AddFriendType>;

const AddFriendContext = createContext<AddFriendType>(null as any);
const AddFriendDispatchContext = createContext<Dispatch<AddFriendDispatchType>>(
  null as any,
);

export function useAddFriend() {
  return useContext(AddFriendContext);
}

export function useAddFriendDispatch() {
  return useContext(AddFriendDispatchContext);
}

function addFriendReducer(
  context: AddFriendType,
  action: AddFriendDispatchType,
): AddFriendType {
  switch (action.type) {
    case 'updateSearchText':
      return {
        ...context,
        searchText: action.searchText ?? '',
      };
    case 'setIsSearching':
      return {
        ...context,
        isSearching: action.isSearching,
      };
    case 'reset':
      requestAnimationFrame(() => context.onCancel());
      return {
        onCancel: context.onCancel,
      };
    default:
      throw Error(`Unkown action type: ${action}`);
  }
}

export function AddFriendProvider({
  onCancel,
  children,
}: {
  onCancel: () => void;
  children: React.ReactNode;
}) {
  const [context, dispatch] = useReducer(addFriendReducer, {
    onCancel: onCancel,
  });

  return (
    <AddFriendContext.Provider value={context}>
      <AddFriendDispatchContext.Provider value={dispatch}>
        {children}
      </AddFriendDispatchContext.Provider>
    </AddFriendContext.Provider>
  );
}
