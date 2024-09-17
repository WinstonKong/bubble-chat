import { Metadata } from 'next';
import { Me } from '@/app/ui/me/me';

export const metadata: Metadata = {
  title: 'Me',
};

export default async function Page() {
  return (
    <div className="h-full w-full">
      <Me />
    </div>
  );
}
