import { UserIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useDebouncedCallback } from 'use-debounce';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { useRef } from 'react';
import { useAddFriend, useAddFriendDispatch } from './add-friend-provider';

export function AddFriendBar() {
  const { searchText, isSearching } = useAddFriend();
  const dispatch = useAddFriendDispatch();
  const inputRef = useRef<HTMLInputElement>(null);
  const handleSearch = useDebouncedCallback((text) => {
    dispatch({ type: 'updateSearchText', searchText: text });
  }, 300);

  const clearFocus = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.blur();
    }
    dispatch({ type: 'updateSearchText', searchText: '' });
  };

  return (
    <div className="flex w-full bg-gray-100 pb-3 pt-5">
      <div className="relative mx-3 flex h-6 flex-grow items-center">
        <input
          name={'search-username'}
          ref={inputRef}
          className="h-full w-full appearance-none rounded-md border-transparent bg-neutral-200 py-2 pl-5 pr-7 text-[12px] text-opacity-30 focus:border-2 focus:border-transparent focus:bg-neutral-200 focus:text-opacity-100 focus:ring-0"
          placeholder={isSearching ? '' : 'Username'}
          onChange={(e) => handleSearch(e.target.value)}
          type="text"
          onFocus={() => {
            dispatch({
              type: 'setIsSearching',
              isSearching: true,
            });
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.preventDefault();
              clearFocus();
            }
          }}
        />
        <UserIcon className="absolute ml-1 h-4 opacity-50" />
        <button
          className={clsx(
            'absolute right-1 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-300 text-center hover:bg-neutral-400',
            {
              hidden: searchText === undefined || searchText === '',
            },
          )}
          onClick={clearFocus}
        >
          <XMarkIcon className="h-3 text-neutral-600" />
        </button>
      </div>
      <button
        className="mr-3 flex h-6 flex-shrink-0 items-center justify-center text-xs"
        onClick={() => dispatch({ type: 'reset' })}
      >
        Cancel
      </button>
    </div>
  );
}
