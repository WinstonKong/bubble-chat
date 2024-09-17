import { Metadata } from 'next';
import { ContactsPanel } from '@/app/ui/contacts/contacts';

export const metadata: Metadata = {
  title: 'Contacts',
};

export default async function page() {
  return (
    <main className="h-full w-full">
      <ContactsPanel />
    </main>
  );
}
