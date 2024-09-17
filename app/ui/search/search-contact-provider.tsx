import { createContext, Dispatch, useContext, useReducer } from 'react';

type SearchContactType = {
  onCancel: () => void;
  onEnter?: () => void;
  searchText?: string;
  isSearching?: boolean;
  exitAfterEnter?: boolean;
  clearInput?: () => void;
};

type SearchContactDispatchType = {
  type:
    | 'clickEnter'
    | 'updateOnEnter'
    | 'updateSearchText'
    | 'updateClearInput'
    | 'setIsSearching'
    | 'reset';
} & Partial<SearchContactType>;

const SearchContactContext = createContext<SearchContactType>(null as any);
const SearchContactDispatchContext = createContext<
  Dispatch<SearchContactDispatchType>
>(null as any);

export function useSearchContact() {
  return useContext(SearchContactContext);
}

export function useSearchContactDispatch() {
  return useContext(SearchContactDispatchContext);
}

function searchContactReducer(
  context: SearchContactType,
  action: SearchContactDispatchType,
): SearchContactType {
  switch (action.type) {
    case 'clickEnter':
      requestAnimationFrame(() => {
        if (action.onEnter) {
          action.onEnter();
        } else {
          context.onEnter?.();
        }
        if (context.exitAfterEnter) {
          context.onCancel?.();
          context.clearInput?.();
        }
      });
      if (context.exitAfterEnter) {
        return {
          ...context,
          isSearching: false,
        };
      }
      return {
        ...context,
      };
    case 'updateOnEnter':
      return {
        ...context,
        onEnter: action.onEnter,
      };
    case 'updateClearInput':
      return {
        ...context,
        clearInput: action.clearInput,
      };
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
      requestAnimationFrame(() => {
        context.onCancel?.();
        if (context.exitAfterEnter) {
          context.clearInput?.();
        }
      });
      return {
        onCancel: context.onCancel,
        exitAfterEnter: context.exitAfterEnter,
        clearInput: context.clearInput,
      };
    default:
      throw Error(`Unkown action type: ${action}`);
  }
}

export function SearchContactProvider({
  onCancel,
  exitAfterEnter,
  children,
}: {
  onCancel: () => void;
  exitAfterEnter?: boolean;
  children: React.ReactNode;
}) {
  const [context, dispatch] = useReducer(searchContactReducer, {
    onCancel: onCancel,
    exitAfterEnter: exitAfterEnter,
  });

  return (
    <SearchContactContext.Provider value={context}>
      <SearchContactDispatchContext.Provider value={dispatch}>
        {children}
      </SearchContactDispatchContext.Provider>
    </SearchContactContext.Provider>
  );
}
