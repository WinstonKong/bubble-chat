import { Metadata } from 'next';
import SignupForm from '@/app/ui/authentation/signup-form';
import { lusitana } from '@/app/ui/fonts';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sign Up',
};

export default function SignupPage() {
  return (
    <main className="flex h-screen items-center justify-center">
      <div className="relative mx-auto -mt-32 flex w-full max-w-[400px] flex-col space-y-2.5 p-4">
        <SignupForm />
        <div className={`${lusitana.className} pl-4 text-sm`}>
          <span>{`Already have an account? `}</span>
          <Link href={'/login'} className="text text-blue-400">
            Log in
          </Link>
        </div>
      </div>
    </main>
  );
}
