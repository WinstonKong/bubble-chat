import { ExclamationCircleIcon } from '@heroicons/react/24/solid';
import { useBubble, useBubbleDispatch } from '../bubble/provider';
import { isLoading } from '../util';
import { Button } from './button';
import { SocketStatus } from '@/app/lib/types';

export function LoadingOrNetworkError({
  hideLoading,
}: {
  hideLoading?: boolean;
}) {
  const context = useBubble();
  if (isLoading(context)) {
    return hideLoading ? <></> : <Loading />;
  }
  return <NetworkError />;
}

export function Loading() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <LoadingCircle />
    </div>
  );
}

export function LoadingCircle() {
  return (
    <div className="relative h-5 w-5 animate-spin rounded-full border-2 border-neutral-400">
      <div className="absolute left-3/4 h-2/3 w-2/3 bg-gray-100"></div>
    </div>
  );
}

export function NetworkError() {
  const context = useBubble();
  const dispatch = useBubbleDispatch();

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <div className="flex w-full items-center justify-center ">
        <ExclamationCircleIcon className="block h-6" />
        <span>Network unavailable. Check the network settings.</span>
      </div>
      <Button
        className="mt-6"
        onClick={() => {
          if (context.io) {
            context.io.connect();
            dispatch({
              type: 'updateIO',
              socketStatus: SocketStatus.initialized,
            });
          }
        }}
      >
        Reload
      </Button>
    </div>
  );
}
