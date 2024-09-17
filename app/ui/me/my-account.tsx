import { useEffect, useRef, useState } from 'react';
import { useBubble, useBubbleDispatch } from '../bubble/provider';
import { DivideLine } from '../component/frame';
import { ExclamationCircleIcon, UserIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import { UserInfo } from '@/app/lib/types';
import { useEditInfo } from '../component/useEditInfo';
import { ArrowPathIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { updateBio, updateNickname } from '@/app/lib/socket';

export function MyAccount() {
  const { user } = useBubble();

  return (
    <div className="flex h-full w-full flex-col pl-20 pt-20">
      {!!user && (
        <div className="flex h-full w-96 flex-col">
          <div className="mb-4 flex w-full">
            <div className="mr-4 flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-md bg-neutral-300">
              <UserIcon className="h-8 text-sm text-gray-400" />
            </div>
            <div className="flex flex-grow flex-col">
              <Nickname user={user} />
              <div className="scrollbar-track-bg-neutral-200 mr-3 max-h-12 overflow-auto break-all text-xs text-gray-500 scrollbar-none scrollbar-thumb-neutral-300">
                {`Username:${user.username}`}
              </div>
            </div>
          </div>

          <DivideLine />
          <Bio user={user} />

          <DivideLine />
        </div>
      )}
    </div>
  );
}

function Bio({ user }: { user: UserInfo }) {
  const { io } = useBubble();
  const dispatchBubble = useBubbleDispatch();
  const { bio: initText } = user;

  const update = (newText: string, callback: (ok: boolean) => void) => {
    updateBio(
      {
        uid: user.id,
        bio: newText,
      },
      dispatchBubble,
      io,
      (ok) => callback(ok),
    );
  };

  return (
    <div className="my-4 flex w-full">
      <div className="mr-3 w-14 flex-shrink-0 text-center text-gray-500 ">
        Bio
      </div>

      <div className="flex w-full items-center">
        <EditableInfo
          initText={initText}
          minLength={0}
          maxLength={190}
          update={update}
        >
          <div className="scrollbar-track-bg-neutral-200 mr-3 flex max-h-56 overflow-auto break-all scrollbar-none scrollbar-thumb-neutral-300">
            {initText}
          </div>
        </EditableInfo>
      </div>
    </div>
  );
}

function Nickname({ user }: { user: UserInfo }) {
  const { io } = useBubble();
  const dispatchBubble = useBubbleDispatch();
  const { nickname: initText } = user;

  const update = (newText: string, callback: (ok: boolean) => void) => {
    updateNickname(
      {
        uid: user.id,
        nickname: newText,
      },
      dispatchBubble,
      io,
      (ok) => callback(ok),
    );
  };

  return (
    <div className="mb-1 flex w-full">
      <EditableInfo
        initText={initText}
        minLength={1}
        maxLength={63}
        update={update}
      >
        <div className="scrollbar-track-bg-neutral-200 flex max-h-20 overflow-auto break-all scrollbar-none scrollbar-thumb-neutral-300">
          {initText}
        </div>
      </EditableInfo>
    </div>
  );
}

function EditableInfo({
  initText,
  minLength,
  maxLength,
  update,
  children,
}: {
  initText: string;
  minLength: number;
  maxLength: number;
  update: (newText: string, callback: (ok: boolean) => void) => void;
  children: React.ReactNode;
}) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [editInfo, dispatchEdit] = useEditInfo(true);
  const { editing, updating, finished, ok } = editInfo;
  const [textLen, setTextLen] = useState(initText.length);

  const updateText = () => {
    dispatchEdit({ type: 'setUpdating' });
    const newText = inputRef.current?.value;
    if (
      newText === undefined ||
      newText.length < minLength ||
      newText.length > maxLength
    ) {
      dispatchEdit({ type: 'setResult', ok: false });
      return;
    }
    if (newText === initText) {
      dispatchEdit({ type: 'setResult', ok: true });
      return;
    }
    update(newText, (ok) => {
      dispatchEdit({ type: 'setResult', ok: ok });
    });
  };

  return (
    <>
      {editing && !(finished && ok) ? (
        <div className="relative flex h-fit w-full items-end text-sm text-neutral-500">
          <textarea
            aria-disabled={updating}
            disabled={updating}
            name={'update-bio'}
            ref={inputRef}
            className={clsx(
              'scrollbar-track-bg-neutral-200 text-md flex-grow resize-none appearance-none overflow-y-auto border-transparent bg-neutral-200 py-2 pb-4 pl-5 scrollbar-thin scrollbar-thumb-neutral-300 aria-disabled:opacity-50 focus:border focus:border-neutral-200 focus:border-transparent focus:text-opacity-100 focus:ring-0',
              {
                'mr-5': !updating && !(finished && !ok),
                'h-20': maxLength < 100,
                'h-56': maxLength >= 100,
              },
            )}
            defaultValue={initText}
            autoFocus={true}
            minLength={minLength}
            maxLength={maxLength}
            onChange={() => {
              if (inputRef.current) {
                const value = inputRef.current.value;
                setTextLen(value.length);
              }
            }}
            onFocus={() => {
              if (inputRef.current) {
                const value = inputRef.current.value;
                inputRef.current.setSelectionRange(value.length, value.length);
              }
            }}
            onBlur={() => {
              updateText();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                dispatchEdit({ type: 'reset' });
              } else if (e.key === 'Enter') {
                updateText();
              }
            }}
          />
          <div className="absolute bottom-2 right-8">{maxLength - textLen}</div>
          {!!updating && <ArrowPathIcon className="mb-2 w-5 animate-spin" />}
          {!!finished && !ok && <ExclamationCircleIcon className="mb-2 w-5" />}
        </div>
      ) : (
        <div className="group flex w-full items-center justify-between">
          {children}
          <button onClick={() => dispatchEdit({ type: 'setEditing' })}>
            <PencilSquareIcon className="w-5 text-gray-500 opacity-0 group-hover:opacity-100" />
          </button>
        </div>
      )}
    </>
  );
}
