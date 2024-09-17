'use client';

import { ChatProvider } from './provider';
import { SideBarPanel } from './side-bar/side-bar';
import { DetailPanel } from './detail/panel';
import { CreateGroupPanel } from './create-group/create-group';

export function ChatsPanel() {
  return (
    <ChatProvider>
      <div className="relative flex h-full w-full flex-grow">
        <div className="flex h-full w-72 flex-shrink-0 flex-col bg-neutral-200">
          <SideBarPanel />
        </div>
        <div className="h-full w-px flex-shrink-0 bg-neutral-200" />
        <div className="h-full flex-1 bg-gray-100">
          <DetailPanel />
        </div>
        <CreateGroupPanel />
      </div>
    </ChatProvider>
  );
}
