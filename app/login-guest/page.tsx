import GuestLoginForm from '@/app/ui/authentation/login-guest';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Browse as Guest',
};

export default function LoginPage() {
  return (
    <main className="flex h-screen items-center justify-center">
      <div className="relative mx-auto -mt-32 flex w-full max-w-[400px] flex-col space-y-2.5 p-4">
        <GuestLoginForm />
      </div>
    </main>
  );
}
