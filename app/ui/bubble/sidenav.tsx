import NavLinks from '@/app/ui/bubble/nav-links';

export default function SideNav() {
  return (
    <div className="relative bottom-0 flex h-full w-auto flex-col bg-zinc-800 px-1 py-4">
      <div className="flex grow flex-col justify-around">
        <NavLinks />
        <div className="block h-auto w-full grow rounded-md"></div>
      </div>
    </div>
  );
}
