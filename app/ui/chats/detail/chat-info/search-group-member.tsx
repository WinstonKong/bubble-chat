import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useDebouncedCallback } from 'use-debounce';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { useCallback, useEffect, useRef } from 'react';
import {
  useSearchContact,
  useSearchContactDispatch,
} from '../../../search/search-contact-provider';

export function SearchGroupMember() {
  const { isSearching, searchText } = useSearchContact();
  const dispatch = useSearchContactDispatch();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = useDebouncedCallback((text) => {
    dispatch({ type: 'updateSearchText', searchText: text });
  }, 300);
  const clearInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.blur();
    }
  }, [inputRef]);
  const clearFocus = () => {
    clearInput();
    dispatch({ type: 'reset' });
  };

  useEffect(() => {
    dispatch({
      type: 'updateClearInput',
      clearInput: clearInput,
    });
  }, [clearInput, dispatch]);

  return (
    <div className="relative flex h-6 flex-grow items-center">
      <input
        name={'search-group-member'}
        ref={inputRef}
        className="h-full w-full appearance-none rounded-md border-transparent bg-neutral-200 py-2 pl-5 pr-2 text-[12px] text-opacity-30 focus:border focus:border-neutral-200 focus:bg-neutral-50 focus:text-opacity-100 focus:ring-0"
        placeholder={isSearching ? '' : 'Search'}
        onChange={(e) => handleSearch(e.target.value)}
        type="text"
        onFocus={() => {
          dispatch({
            type: 'setIsSearching',
            isSearching: true,
          });
        }}
        onBlur={() => {
          if (inputRef.current?.value === '') {
            dispatch({ type: 'reset' });
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.preventDefault();
            clearFocus();
          } else if (e.key === 'Enter') {
            dispatch({ type: 'clickEnter' });
          }
        }}
      />
      <MagnifyingGlassIcon className="absolute ml-1 h-3 opacity-50" />
      <button
        className={clsx(
          'absolute right-1 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-300 text-center hover:bg-neutral-400',
          {
            hidden:
              !isSearching || searchText === undefined || searchText === '',
          },
        )}
        onClick={clearFocus}
      >
        <XMarkIcon className="h-3 text-neutral-600" />
      </button>
    </div>
  );
}
