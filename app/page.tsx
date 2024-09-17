import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { lusitana } from '@/app/ui/fonts';

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col p-6">
      <div className="mt-4 flex grow flex-col gap-4 md:flex-row">
        <div className="flex flex-col justify-center gap-6 rounded-lg bg-gray-50 px-6 py-10 md:w-2/5 md:px-20">
          {/* <div className="h-0 w-0 border-b-[30px] border-l-[20px] border-r-[20px] border-b-black border-l-transparent border-r-transparent" /> */}
          <p
            className={`text-3xl leading-normal text-gray-800 ${lusitana.className}`}
          >
            <strong>Welcome to Bubble.</strong>
          </p>
          <Link
            href="/login"
            className="flex items-center gap-5 self-start rounded-lg bg-blue-500 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-blue-400"
          >
            <span>Log in</span> <ArrowRightIcon className="w-6" />
          </Link>
          <Link
            href="/signup"
            className="flex items-center gap-5 self-start rounded-lg bg-blue-500 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-blue-400"
          >
            <span>Sign up</span> <ArrowRightIcon className="w-6" />
          </Link>
        </div>
      </div>
    </main>
  );
}
