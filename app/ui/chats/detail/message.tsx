import { useBubble, useBubbleDispatch } from '../../bubble/provider';
import { ExclamationCircleIcon, UserIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';
import { MessageInfo, MessageSendStatus, UserInfo } from '@/app/lib/types';
import { sendMessage } from '@/app/lib/socket';
import { getDateAndTime, isSystemMessage } from '../../util';

export function MessageEntry({
  message,
  isDM,
  dmUser,
  clickPhoto,
}: {
  message: MessageInfo;
  isDM: boolean;
  dmUser?: UserInfo;
  clickPhoto: () => void;
}) {
  const { userID, user, createdAt, sendStatus, content } = message;
  const { uid, io } = useBubble();
  const dispatchBubble = useBubbleDispatch();
  const isCurrentUser = userID === uid;

  if (isSystemMessage(message)) {
    return <SystemMessage message={message} isDM={isDM} dmUser={dmUser} />;
  }

  return (
    <div
      className={clsx('flex w-full pt-2', {
        'flex-row-reverse': isCurrentUser,
      })}
    >
      <UserPhoto onClick={clickPhoto} />
      <div
        className={clsx('mx-2 flex w-3/4', {
          'justify-end': isCurrentUser,
        })}
      >
        <div className="flex flex-col">
          <div
            className={clsx('flex items-end', {
              'justify-end': isCurrentUser,
            })}
          >
            {!isDM && !isCurrentUser ? (
              <div className="mr-3 text-sm text-neutral-400">
                {user.nickname}
              </div>
            ) : (
              <></>
            )}
            <div className="text-xs text-neutral-400 ">
              {getDateAndTime(createdAt, isCurrentUser)}
            </div>
          </div>
          <div
            className={clsx('flex items-center', {
              'self-end': isCurrentUser,
              'self-start': !isCurrentUser,
            })}
          >
            {sendStatus?.valueOf() === MessageSendStatus.sending ? (
              <div className="relative mr-2 h-4 w-4 flex-shrink-0 animate-spin rounded-full border-2 border-neutral-400">
                <div className="absolute left-3/4 h-2/3 w-2/3 bg-gray-100"></div>
              </div>
            ) : sendStatus?.valueOf() === MessageSendStatus.failed ? (
              <button>
                <ExclamationCircleIcon
                  className="mr-2 w-6 text-green-600"
                  onClick={() => {
                    const localMessage = {
                      ...message,
                      sendStatus: MessageSendStatus.sending,
                    };
                    dispatchBubble({
                      type: 'upsertMessages',
                      messages: { [localMessage.id]: localMessage },
                    });
                    sendMessage(message, dispatchBubble, io);
                  }}
                />
              </button>
            ) : (
              <></>
            )}

            <div
              className={clsx('flex break-all rounded-md px-2 py-2', {
                'bg-green-300 hover:bg-green-400': isCurrentUser,
                'bg-white hover:bg-neutral-300': !isCurrentUser,
              })}
            >
              {content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function UserPhoto({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="mt-2 flex h-9 w-9 flex-shrink-0 items-center justify-center bg-neutral-300"
    >
      <UserIcon className="h-5 text-sm text-gray-400" />
    </button>
  );
}

function SystemMessage({
  message,
  isDM,
  dmUser,
}: {
  message: MessageInfo;
  isDM: boolean;
  dmUser?: UserInfo;
}) {
  const { messageType, createdAt } = message;
  const time = getDateAndTime(createdAt);
  switch (messageType) {
    case 'ChannelStart':
      return (
        <div className="flex w-full flex-col">
          <div className="pt-2 text-center text-sm text-gray-500">{time}</div>
          <div className="inline w-full break-all px-2 pb-2 text-center text-gray-500">
            {!isDM ? (
              `This is the beginning of the group's message history.`
            ) : (
              <>
                This is the beginning of your direct message history with
                <span className="ml-1 text-black">
                  {dmUser?.nickname ?? ''}
                </span>
                .
              </>
            )}
          </div>
        </div>
      );
    case 'JoinChannel':
      return (
        <div className="flex w-full flex-col">
          <div className="pt-2 text-center text-sm text-gray-500">{time}</div>
          <div className="inline w-full break-all px-2 pb-2 text-center text-gray-500">
            <span className="mr-1 text-black">
              {message.user?.nickname ?? ''}
            </span>
            joind group chat.
          </div>
        </div>
      );
    case 'AddFriend':
      return (
        <div className="inline w-full break-all px-2 py-2 text-center text-gray-500">
          <div className="pt-2 text-center text-sm text-gray-500">{time}</div>
          <div className="inline w-full break-all px-2 py-2 text-center text-gray-500">
            You are already friends.
          </div>
        </div>
      );
    default:
      return <></>;
  }
}
