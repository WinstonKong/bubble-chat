import { leaveChannel } from '@/app/lib/socket';
import { useBubble, useBubbleDispatch } from '@/app/ui/bubble/provider';
import { useEditInfo } from '../../../component/useEditInfo';
import { ChannelInfo } from '@/app/lib/types';
import { ActionFailedTips } from '@/app/ui/util';

export function LeavingDialog({
  channel,
  dismiss,
}: {
  channel: ChannelInfo;
  dismiss: () => void;
}) {
  const { id, name } = channel;
  const { uid, io } = useBubble();
  const dispatchBubble = useBubbleDispatch();
  const [editInfo, dispatchEdit] = useEditInfo(true);
  const { updating, finished, ok } = editInfo;

  const leave = async () => {
    dispatchEdit({ type: 'setUpdating' });
    leaveChannel(
      {
        uid: uid,
        channelID: id,
      },
      dispatchBubble,
      io,
      (ok) => {
        dispatchEdit({ type: 'setResult', ok: ok });
        if (ok) {
          dispatchBubble({
            type: 'openChannel',
            openChannelID: undefined,
          });
        }
      },
    );
  };

  return (
    <div className="flex h-40 w-64 flex-col items-center px-3">
      <div className="mt-6 truncate font-medium">Leaving group chat</div>
      <div className="w-full truncate text-center font-medium">{name}</div>
      <div className="mt-8 flex w-full justify-between px-2">
        <button
          onClick={leave}
          aria-disabled={updating}
          disabled={updating}
          className="text-md mr-2 flex flex-1 items-center justify-center rounded-sm bg-neutral-100 py-1 text-green-600 aria-disabled:opacity-50 hover:bg-neutral-200"
        >
          <span className="text-green-600">Leave</span>
        </button>

        <button
          onClick={dismiss}
          aria-disabled={updating}
          disabled={updating}
          className="text-md ml-2 flex flex-1 items-center justify-center rounded-sm bg-neutral-100 py-1 aria-disabled:opacity-50 hover:bg-neutral-200"
        >
          Cancel
        </button>
      </div>
      {!!finished && !ok && (
        <div className="mt-1 flex w-full justify-between px-2 text-xs text-gray-500">
          {ActionFailedTips}
        </div>
      )}
    </div>
  );
}
