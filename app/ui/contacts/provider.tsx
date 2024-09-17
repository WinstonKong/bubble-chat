'use client';

import { ContactsUIState } from './type';
import { Context, createContext, useContext, useState } from 'react';

export type ContactContextWrapperType = {
  context: ContactsUIState;
  setContext: (context: ContactsUIState) => void;
};

export const ContactContext: Context<ContactContextWrapperType> = createContext(
  null as any,
);

export function useContact() {
  return useContext(ContactContext);
}

export function ContactProvider({ children }: { children: React.ReactNode }) {
  const [context, setContext] = useState({});

  return (
    <ContactContext.Provider
      value={{
        context: context,
        setContext: setContext,
      }}
    >
      {children}
    </ContactContext.Provider>
  );
}
