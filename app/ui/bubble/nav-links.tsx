'use client';

import {
  UserCircleIcon,
  ChatBubbleOvalLeftIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import {
  UserCircleIcon as UserCircleIconSelected,
  ChatBubbleOvalLeftIcon as ChatBubbleOvalLeftIconSelected,
  UsersIcon as UsersIconSelected,
} from '@heroicons/react/20/solid';

const links = [
  {
    name: 'Chats',
    href: '/bubble/chats',
    icon: ChatBubbleOvalLeftIcon,
    iconSelected: ChatBubbleOvalLeftIconSelected,
  },
  {
    name: 'Contacts',
    href: '/bubble/contacts',
    icon: UsersIcon,
    iconSelected: UsersIconSelected,
  },
  {
    name: 'Me',
    href: '/bubble/me',
    icon: UserCircleIcon,
    iconSelected: UserCircleIconSelected,
  },
];

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <>
      {links.map((link) => {
        const isSelectedPage = pathname === link.href;
        const LinkIcon = isSelectedPage ? link.iconSelected : link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              'flex h-12 w-12 flex-none justify-start p-2 px-3 text-sm font-medium hover:text-green-500',
              {
                'text-green-500': isSelectedPage,
              },
              { 'text-white opacity-50': !isSelectedPage },
            )}
          >
            <LinkIcon className="w-6" />
          </Link>
        );
      })}
    </>
  );
}
