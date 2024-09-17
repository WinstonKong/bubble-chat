import { logOut } from '@/app/lib/actions';
import { useAccountDispatch } from './provider';
import { useBubble } from '../bubble/provider';

export function LogOutDialog() {
  const { io } = useBubble();
  const dispatch = useAccountDispatch();

  return (
    <div className=" h-52 w-96 bg-white px-6 py-4 shadow-md">
      <div className=" text-lg font-semibold">Log Out</div>
      <div className="mt-3 text-gray-500">
        Are you sure you want to log out?
      </div>
      <div className="mt-14 flex w-full justify-between">
        <button
          onClick={async () => {
            io?.disconnect();
            await logOut();
          }}
          className="text-md mr-2 flex flex-1 items-center justify-center rounded-sm bg-green-600 py-1 text-white hover:bg-green-500"
        >
          OK
        </button>

        <button
          onClick={() => dispatch({ type: 'logOut', logOut: false })}
          className="text-md ml-2 flex flex-1 items-center justify-center rounded-sm bg-neutral-100 py-1 text-green-600 hover:bg-neutral-200"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
