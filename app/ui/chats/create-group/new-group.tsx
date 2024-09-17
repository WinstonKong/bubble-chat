import clsx from 'clsx';
import { useChat, useChatDispatch } from '../provider';
import {
  useCreateGroup,
  useCreateGroupDispatch,
  useNewGroupUser,
} from './create-group-provider';
import { UserIcon } from '@heroicons/react/24/solid';
import { XMarkIcon } from '@heroicons/react/24/outline';
import {
  ActionFailedTips,
  chatToChannel,
  chatWithUser,
  getDefaultGroupName,
} from '../../util';
import { useBubble, useBubbleDispatch } from '../../bubble/provider';
import { addUsersToChannel, createChannel } from '@/app/lib/socket';

export function NewGroupContact() {
  const { createNewGroup } = useChat();
  const { dmUser, addToChannel } = createNewGroup ?? {};
  const { uid, user, channels, io } = useBubble();
  const dispatchBubble = useBubbleDispatch();
  const users = useNewGroupUser();
  const { isCreating, createOK } = useCreateGroup();
  const dispatch = useCreateGroupDispatch();
  const dispatchChat = useChatDispatch();
  const cancel = () => {
    dispatch({ type: 'reset' });
    dispatchChat({
      type: 'setCreateNewGroup',
      createNewGroup: { creating: false },
    });
  };

  const done = async () => {
    if (users.length === 0) {
      return;
    }
    if (
      users.length === 1 &&
      dmUser === undefined &&
      addToChannel === undefined
    ) {
      cancel();
      const toUser = users[0];
      chatWithUser(toUser.id, uid, channels, dispatchBubble);
      return;
    }
    dispatch({
      type: 'setIsCreating',
      isCreating: true,
    });
    if (!!addToChannel) {
      const { channelID } = addToChannel;
      addUsersToChannel(
        { uid: uid, channelID: channelID, uids: users.map((u) => u.id) },
        dispatchBubble,
        io,
        (ok, data) => {
          if (ok) {
            cancel();
          } else {
            dispatch({
              type: 'setIsCreating',
              isCreating: false,
              createOK: false,
            });
          }
        },
      );
      return;
    }
    const otherUers = !!dmUser ? [dmUser, ...users] : users;
    const groupName = getDefaultGroupName(
      user ? [user, ...otherUers] : otherUers,
    );
    createChannel(
      {
        createrID: uid,
        otherUIDs: otherUers.map((u) => u.id),
        channelName: groupName,
      },
      dispatchBubble,
      io,
      (ok, data) => {
        if (ok) {
          cancel();
          const channels = data?.channels
          if (channels) {
            const channel = Object.values(channels)[0];
            if (channel) {
              chatToChannel(channel.id, dispatchBubble);
            }
          }
        } else {
          dispatch({
            type: 'setIsCreating',
            isCreating: false,
            createOK: false,
          });
        }
      },
    );
  };

  const groupIsEmpty = users.length === 0;
  const disableNone = groupIsEmpty || isCreating;
  return (
    <div className="flex h-96 w-full flex-col justify-between">
      <div className="grid grid-cols-3 overflow-y-auto overflow-x-hidden px-10 scrollbar-none">
        {users.map((u) => {
          return (
            <div
              key={u.id}
              className="flex h-max w-20 flex-col items-center pt-2"
            >
              <div className="relative flex h-10 w-10 items-center justify-center rounded-sm bg-neutral-200">
                <UserIcon className="h-6 text-sm text-gray-400" />
                <button
                  aria-disabled={isCreating}
                  disabled={isCreating}
                  className="absolute -right-2 -top-2 flex h-5 w-5 scale-75 content-center items-center justify-center rounded-full bg-neutral-300 text-white hover:bg-neutral-400"
                  onClick={() => {
                    dispatch({ type: 'removeUser', user: u });
                  }}
                >
                  <XMarkIcon className="w-4" />
                </button>
              </div>
              <div className="my-1 w-20 truncate px-1 text-center text-sm">
                {u.nickname}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex flex-shrink-0 flex-col ">
        <div className="flex">
          <button
            aria-disabled={disableNone}
            disabled={disableNone}
            className={clsx(
              'ml-7 mr-5 flex h-7 items-center rounded-sm px-10 aria-disabled:opacity-50',
              {
                'bg-green-500 text-white': !groupIsEmpty,
                'bg-neutral-200 text-neutral-800': groupIsEmpty,
                'hover:bg-green-400': !groupIsEmpty && !isCreating,
              },
            )}
            onClick={done}
          >
            Done
          </button>
          <button
            disabled={isCreating}
            aria-disabled={isCreating}
            className={clsx(
              'flex h-7 items-center rounded-sm bg-neutral-100 px-10  text-green-600 aria-disabled:opacity-50',
              {
                'hover:bg-neutral-200': !isCreating,
              },
            )}
            onClick={cancel}
          >
            Cancel
          </button>
        </div>
        <div className="h-6 pt-1 text-center text-xs text-gray-400">
          {!isCreating && createOK === false ? ActionFailedTips : ''}
        </div>
      </div>
    </div>
  );
}
