import { BubbleContextType } from '@/app/ui/bubble/provider';
import { SocketStatus } from '@/app/lib/types';

export function isLoadingOrFailed(context: BubbleContextType) {
  return isLoading(context) || isFailed(context);
}

function waitingInitInfo(context: BubbleContextType) {
  return context.initLoadStatus === undefined;
}

function failedInitInfo(context: BubbleContextType) {
  return context.initLoadStatus === 'failed';
}

export function isLoading(context: BubbleContextType) {
  return (
    !context.socketStatus ||
    context.socketStatus === SocketStatus.initialized ||
    (context.socketStatus === SocketStatus.connected &&
      waitingInitInfo(context))
  );
}

export function isFailed(context: BubbleContextType) {
  return (
    context.socketStatus === SocketStatus.disconnected ||
    failedInitInfo(context)
  );
}
