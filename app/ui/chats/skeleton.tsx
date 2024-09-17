import { useBubble } from '../bubble/provider';
import { isFailed, isLoading } from '../util';

export function ChannelTableSkeleton() {
  const context = useBubble();

  if (isFailed(context)) {
    return <></>;
  }

  if (!isLoading(context)) {
    return (
      <div className="flex h-full w-full items-center justify-center text-neutral-400">
        <div>{`It's quiet for now...`}</div>
      </div>
    );
  }

  const channels = new Array(6).fill(null);
  return (
    <div className="flex w-full flex-col">
      {channels.map((_, i) => (
        <ChannelEntrySkeleton key={i} />
      ))}
    </div>
  );
}

export function ChannelEntrySkeleton() {
  return (
    <div className="flex h-14 w-full animate-pulse items-center px-3 py-3">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-sm bg-neutral-300"></div>
      <div className="ml-3 flex h-full w-full flex-col justify-between">
        <div className="h-2  w-1/3 rounded bg-neutral-300" />
        <div className="h-2 w-4/5 rounded bg-neutral-300" />
      </div>
    </div>
  );
}
