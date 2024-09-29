'use client';

import {
  ArrowPathIcon,
  AtSymbolIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from '@/app/ui/component/button';
import { authenticateGuest } from '@/app/lib/actions';
import { ActionFailedTips } from '../util';
import { useEffect, useState } from 'react';
import { lusitana } from '@/app/ui/fonts';

export default function GuestLoginForm() {
  const [status, setStatus] = useState({
    handling: true,
    error: false,
  });

  const login = async () => {
    try {
      const error = await authenticateGuest();
      if (!!error) {
        setStatus({ handling: false, error: true });
      } else {
        setStatus({ handling: false, error: false });
      }
    } catch (e) {
      setStatus({ handling: false, error: true });
    }
  };

  useEffect(() => {
    login();
  }, []);

  const showHandling = status.handling || !status.error;

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
        <h1 className={`${lusitana.className} mb-3 text-2xl`}>
          Browse as Guest.
        </h1>
        <div className="w-full">
          <div>
            <label
              className="mb-3 mt-5 block text-xs font-medium text-gray-900"
              htmlFor="guest-username"
            >
              Username
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="guest-username"
                type="text"
                name="guest-username"
                value="Guest"
                disabled={true}
                aria-disabled={true}
              />
              <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
        </div>
        <Button
          className="mt-4 w-full"
          aria-disabled={showHandling}
          disabled={showHandling}
          onClick={async () => {
            setStatus({ handling: true, error: false });
            await login();
          }}
        >
          Log in
          {showHandling ? (
            <ArrowPathIcon className="ml-auto h-5 w-5 animate-spin text-gray-50" />
          ) : (
            <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
          )}
        </Button>
        <div className="flex h-8 items-end space-x-1">
          {status.error && (
            <>
              <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
              <p className="text-sm text-red-500">{ActionFailedTips}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
