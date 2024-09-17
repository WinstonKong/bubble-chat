import { PlusIcon } from '@heroicons/react/24/outline';
import { useChatDispatch } from '../../provider';
import { useChatInfo } from './chat-info';

export function AddMemberButton() {
  const dispatchChat = useChatDispatch();
  const { channel, isDM, dmUser } = useChatInfo();

  return (
    <button
      className="flex h-max w-12 flex-grow-0 flex-col items-center overflow-hidden pt-2"
      onClick={(e) => {
        e.stopPropagation();
        if (isDM) {
          dispatchChat({
            type: 'setCreateNewGroup',
            createNewGroup: { creating: true, dmUser: dmUser },
          });
        } else {
          dispatchChat({
            type: 'setCreateNewGroup',
            createNewGroup: {
              creating: true,
              addToChannel: {
                channelID: channel.id,
                existedMembers: new Set(channel.userIDs),
              },
            },
          });
        }
      }}
    >
      <div className="group flex h-8 w-8 items-center justify-center rounded-sm border border-neutral-300 hover:border-neutral-400">
        <PlusIcon className="h-5 text-sm text-gray-500 group-hover:text-gray-700" />
      </div>
      <div className="my-1 w-12 truncate text-center text-xs">Add</div>
    </button>
  );
}
