'use client';

import {
  createContext,
  Context,
  useContext,
  useReducer,
  Dispatch,
} from 'react';

type AccountContextType = {
  myAccount?: boolean;
  logOut?: boolean;
};

type BubbleActionType = 'showMyAccout' | 'logOut';

type accountDispatchType = {
  type: BubbleActionType;
} & Partial<AccountContextType>;

const AccountContext: Context<AccountContextType> = createContext(null as any);
const AccountDispatchContext: Context<Dispatch<accountDispatchType>> =
  createContext(null as any);

export function useAccount() {
  return useContext(AccountContext);
}

export function useAccountDispatch() {
  return useContext(AccountDispatchContext);
}

function accountReducer(
  context: AccountContextType,
  action: accountDispatchType,
): AccountContextType {
  switch (action.type) {
    case 'logOut':
      return {
        ...context,
        logOut: action.logOut,
      };
    case 'showMyAccout':
      return {
        myAccount: true,
      };
    default: {
      throw Error('Unknown action: ' + action.type);
    }
  }
}

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [context, dispatch] = useReducer(accountReducer, {
    myAccount: true,
  });

  return (
    <AccountContext.Provider value={context}>
      <AccountDispatchContext.Provider value={dispatch}>
        {children}
      </AccountDispatchContext.Provider>
    </AccountContext.Provider>
  );
}
