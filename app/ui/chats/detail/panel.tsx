import { useBubble } from '../../bubble/provider';
import { LoadingOrNetworkError } from '../../component/network';
import { isLoadingOrFailed } from '../../util';
import { ChatRoom } from './room';

export function DetailPanel() {
  const bubble = useBubble();

  if (isLoadingOrFailed(bubble)) {
    return <LoadingOrNetworkError hideLoading={false} />;
  }

  if (bubble.openChannelID !== undefined) {
    return <ChatRoom channelID={bubble.openChannelID} />;
  }

  return <></>;
}
