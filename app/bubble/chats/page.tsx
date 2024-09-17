import { Metadata } from 'next';
import { ChatsPanel } from '@/app/ui/chats/chats';

export const metadata: Metadata = {
  title: 'Chats',
};

export default function Chat() {
  return (
    <div className="h-full w-full">
      <ChatsPanel />
    </div>
  );
}
