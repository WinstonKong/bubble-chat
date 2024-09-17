'use client';

import { DetailPanel } from './detail';
import { AccountProvider } from './provider';
import { SideBarPanel } from './side-bar';

export function Me() {
  return (
    <AccountProvider>
      <div className="flex h-full w-full flex-grow">
        <div className="flex h-full w-72 flex-shrink-0 flex-col bg-neutral-200">
          <SideBarPanel />
        </div>
        <div className="h-full w-px flex-shrink-0 bg-neutral-200" />
        <div className="h-full flex-1 bg-white">
          <DetailPanel />
        </div>
      </div>
    </AccountProvider>
  );
}
