'use client';

import { lusitana } from '@/app/ui/fonts';
import {
  AtSymbolIcon,
  KeyIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import {
  ArrowRightIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/20/solid';
import { Button } from '../component/button';
import { signup } from '@/app/lib/actions';
import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';

import clsx from 'clsx';

export default function SignupForm() {
  const [errorMessage, formAction] = useFormState(signup, undefined);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="space-y-3">
      <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
        <h1 className={`${lusitana.className} mb-3 text-2xl`}>Join Bubble</h1>
        <div className="w-full">
          <div>
            <label
              className="mb-3 mt-5 block text-xs font-medium text-gray-900"
              htmlFor="username"
            >
              Username
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="username"
                type="text"
                name="username"
                placeholder="Enter your username"
                maxLength={63}
                minLength={1}
                required
              />
              <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
          <div className="mt-4">
            <label
              className="mb-3 mt-5 block text-xs font-medium text-gray-900"
              htmlFor="nickname"
            >
              Nickname
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="nickname"
                type="text"
                name="nickname"
                placeholder="Enter your nickname"
                maxLength={63}
                minLength={1}
                required
              />
              <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
          <div className="mt-4">
            <label
              className="mb-3 mt-5 block text-xs font-medium text-gray-900"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 pr-10 text-sm outline-2 placeholder:text-gray-500"
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Enter password"
                required
                minLength={6}
              />
              <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
              <EyeIcon
                onClick={() => setShowPassword(!showPassword)}
                className={clsx(
                  'absolute right-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900',
                  {
                    hidden: !showPassword,
                  },
                )}
              />
              <EyeSlashIcon
                onClick={() => setShowPassword(!showPassword)}
                className={clsx(
                  'absolute right-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900',
                  {
                    hidden: showPassword,
                  },
                )}
              />
            </div>
          </div>
        </div>
        <SignupButton />
        <div className="flex h-8 items-end space-x-1">
          {errorMessage && (
            <>
              <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
              <p className="text-sm text-red-500">{errorMessage}</p>
            </>
          )}
        </div>
      </div>
    </form>
  );
}

function SignupButton() {
  const { pending: disabled } = useFormStatus();
  return (
    <Button className="mt-4 w-full" aria-disabled={disabled} disabled={disabled}>
      Sign up <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
    </Button>
  );
}
