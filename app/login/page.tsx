import LoginForm from '@/app/ui/authentation/login-form';
import { Metadata } from 'next';
import Link from 'next/link';
import { lusitana } from '../ui/fonts';

export const metadata: Metadata = {
  title: 'Login',
};

export default function LoginPage() {
  return (
    <main className="flex h-screen items-center justify-center">
      <div className="relative mx-auto -mt-32 flex w-full max-w-[400px] flex-col space-y-2.5 p-4">
        <LoginForm />
        <div className={`${lusitana.className} pl-4 text-sm`}>
          <span>{`Don't have an account? `}</span>
          <Link href={'/signup'} className="text text-blue-400">
            Create one
          </Link>
        </div>
        <div className={`${lusitana.className} pl-4 text-sm`}>
          <span>{`Or, `}</span>
          <Link href={'/login-guest'} className="text text-blue-400">
            Browse as Guest
          </Link>
        </div>
      </div>
    </main>
  );
}
