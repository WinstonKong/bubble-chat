import { useBubble } from '../bubble/provider';
import { LoadingOrNetworkError } from '../component/network';
import { isLoadingOrFailed } from '../util';
import { LogOutDialog } from './log-out';
import { MyAccount } from './my-account';
import { useAccount } from './provider';

export function DetailPanel() {
  const bubble = useBubble();
  const { myAccount, logOut } = useAccount();

  if (isLoadingOrFailed(bubble)) {
    if (!!logOut) {
      return (
        <div className="relative h-full w-full bg-gray-100">
          <div className="absolute ml-20 mt-20">
            <LogOutDialog />
          </div>
        </div>
      );
    }
    return (
      <div className="relative h-full w-full bg-gray-100">
        <LoadingOrNetworkError />
      </div>
    );
  }

  return (
    <div className="realtive h-full w-full">
      {!!logOut && (
        <div className="absolute ml-20 mt-20">
          <LogOutDialog />
        </div>
      )}
      {!!myAccount && <MyAccount />}
    </div>
  );
}
