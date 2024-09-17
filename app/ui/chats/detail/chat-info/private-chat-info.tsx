import { UserInfo } from '@/app/lib/types';
import { UserIcon } from '@heroicons/react/24/solid';
import { useChatInfo } from './chat-info';
import { AddMemberButton } from './add-member';

export function DMChatInfo() {
  const { dmUser, setSelectUserID } = useChatInfo();

  return (
    <div
      className="scrollbar-track-bg-neutral-200 verflow-y-auto h-full w-64 flex-shrink-0 overflow-auto overflow-x-hidden border-l border-neutral-300 scrollbar-thin scrollbar-thumb-neutral-300"
      onClick={(e) => {
        setSelectUserID(undefined);
        e.stopPropagation();
      }}
    >
      {!!dmUser && (
        <div className="ml-4 mt-3 grid w-56 grow-0 grid-cols-4">
          <Member u={dmUser} />
          <AddMemberButton />
        </div>
      )}
    </div>
  );
}

function Member({ u }: { u: UserInfo }) {
  const { setSelectUserID } = useChatInfo();

  return (
    <button
      className="flex h-max w-12 flex-grow-0 flex-col items-center overflow-hidden pt-2"
      onClick={(e) => {
        e.stopPropagation();
        setSelectUserID(u.id);
      }}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-neutral-200">
        <UserIcon className="h-5 text-sm text-gray-400" />
      </div>
      <div className="my-1 w-12 truncate text-center text-xs">{u.nickname}</div>
    </button>
  );
}
