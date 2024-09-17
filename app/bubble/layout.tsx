import SideNav from '@/app/ui/bubble/sidenav';
import { auth } from '@/auth';
import BubbleProvider from '@/app/ui/bubble/provider';
import { Logger } from '@/app/lib/utils';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const uid = session?.user?.id;
  if (uid === undefined) {
    Logger.error('Unauthorized access');
    return <div></div>;
  }

  return (
    <BubbleProvider uid={uid}>
      <div className="relative flex h-screen flex-row overflow-hidden">
        <SideNav />
        <div className="flex-grow overflow-y-auto">{children}</div>
      </div>
    </BubbleProvider>
  );
}
