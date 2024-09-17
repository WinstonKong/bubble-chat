import {
  ArrowPathIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { DivideLine } from '../../component/frame';
import { useBubble, useBubbleDispatch } from '../../bubble/provider';
import { useCallback, useEffect } from 'react';
import { UserInfo } from '@/app/lib/types';
import { useContact } from '../provider';
import { fetchUser } from '@/app/lib/socket';
import { useHandlerState } from '@/app/ui/component/useHandlerState';
import { useAddFriend } from './add-friend-provider';

export function AddFriendTable() {
  const { io } = useBubble();
  const dispatchBubble = useBubbleDispatch();
  const { setContext } = useContact();
  const { searchText } = useAddFriend();

  const [handlers, dispatchHandlers] = useHandlerState<{
    isSearching: boolean;
    finished?: boolean;
    user?: UserInfo;
  }>();

  const search = useCallback(
    (text: string) => {
      dispatchHandlers({
        type: 'add',
        id: text,
        value: {
          isSearching: true,
        },
      });
      fetchUser(undefined, text, dispatchBubble, io, (ok, data) => {
        dispatchHandlers({
          type: 'update',
          id: text,
          value: {
            isSearching: false,
            finished: true,
            ...(ok && data ? { user: data } : undefined),
          },
        });
      });
    },
    [dispatchBubble, io, dispatchHandlers],
  );

  useEffect(() => {
    const handlerCount = Object.keys(handlers).length;
    if (searchText !== undefined && searchText.length > 0) {
      const currentHandler = handlers[searchText];
      if (currentHandler !== undefined) {
        if (currentHandler.user) {
          setContext({
            selectedUser: currentHandler.user,
          });
        }
        if (handlerCount > 1) {
          dispatchHandlers({
            type: 'remove',
            filterFunc: (id, value) => id !== searchText,
          });
        }
        return;
      }
    }

    if (handlerCount > 0) {
      dispatchHandlers({
        type: 'reset',
      });
    }
  }, [handlers, searchText, dispatchHandlers, setContext]);

  if (searchText === undefined || searchText.length === 0) {
    return <></>;
  }
  const handler = handlers[searchText];
  return (
    <div className="h-full w-full">
      <DivideLine />
      {handler?.finished ? (
        handler.user ? (
          <></>
        ) : (
          <div className="w-full bg-gray-100 px-10 pb-3 pt-4 text-center text-sm text-gray-500">
            User not found. Check and try agian.
          </div>
        )
      ) : (
        <div
          className="flex h-14 w-full items-center bg-neutral-100 pl-3 hover:bg-neutral-300"
          onClick={() => search(searchText)}
        >
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-green-600">
            <MagnifyingGlassIcon className="h-5 text-sm text-white" />
          </div>
          <div className="ml-3 flex flex-grow items-center overflow-hidden">
            <div className="">Search:</div>
            <div className="truncate text-green-500">{searchText}</div>
          </div>
          {handler?.isSearching ? (
            <ArrowPathIcon className="h-4 flex-shrink-0 animate-spin text-sm text-gray-400" />
          ) : (
            <ChevronRightIcon className="h-4 flex-shrink-0 text-sm text-gray-400" />
          )}
        </div>
      )}
    </div>
  );
}
