import clsx from 'clsx';
import { useAccount, useAccountDispatch } from './provider';

export function SideBarPanel() {
  const { myAccount } = useAccount();
  const dispatchAccount = useAccountDispatch();
  return (
    <div className="flex h-full w-full flex-col">
      <div className="mb-10 mt-14 flex w-full justify-center">Settings</div>
      <button
        className={clsx(
          'flex w-full items-center justify-center border-r-2 py-3',
          {
            'border-green-500 text-green-500': !!myAccount,
          },
        )}
        onClick={() => dispatchAccount({ type: 'showMyAccout' })}
      >
        My Account
      </button>
      <div></div>
      <button
        className="flex w-full items-center justify-center py-3"
        onClick={() => dispatchAccount({ type: 'logOut', logOut: true })}
      >
        Log Out
      </button>
    </div>
  );
}
