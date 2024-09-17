import { useInView } from 'react-intersection-observer';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useBubble, useBubbleDispatch } from '../../bubble/provider';
import {
  getChannelMessages,
  getDMUid,
  getDMUser,
  isPrivateChannel,
  submitNewMessage,
} from '../../util';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import { ChannelInfo, MessageSendStatus } from '@/app/lib/types';
import { DivideLine } from '../../component/frame';
import { InputArea } from './input';
import { MessageEntry } from './message';
import { fetchMessages, fetchUser } from '@/app/lib/socket';
import { ChatInfo } from './chat-info/chat-info';
import { LoadUserProfile } from '../../contacts/user';
import { LeavingDialog } from './chat-info/leaving-dialog';
import { MessageType } from '@prisma/client';
import clsx from 'clsx';

export function ChatRoom({ channelID }: { channelID: string }) {
  const { channels } = useBubble();
  const channel = channels ? channels[channelID] : undefined;

  if (!channel) {
    return (
      <div className="flex h-full w-full justify-center pt-28">
        <div className="text-sm text-gray-500">
          Message not found. Check and try again.
        </div>
      </div>
    );
  }
  return <ChannelRoom channel={channel} />;
}

function ChannelRoom({ channel }: { channel: ChannelInfo }) {
  const { uid, io, users, messages } = useBubble();
  const dispatchBubble = useBubbleDispatch();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { ref: loadingRef, inView: loadingInView } = useInView();
  const { ref: allReadRef, inView: allReadInView } = useInView();
  const { id: channelID } = channel;
  const isDM = isPrivateChannel(channel);
  const dmUser = useMemo(() => {
    return getDMUser(channel, users, uid);
  }, [channel, users, uid]);
  const [selectUserID, setSelectUserID] = useState<string | undefined>(
    undefined,
  );
  const [showChatInfo, setShowChatInfo] = useState(false);
  const [showLeaving, setShowLeaving] = useState(false);

  const title = isDM
    ? dmUser?.nickname ?? ''
    : `${channel.name}(${channel.userIDs.length})`;
  const channelMessages = useMemo(
    () =>
      getChannelMessages(channelID, messages, true).filter(
        (m) => m.sendStatus?.valueOf() !== MessageSendStatus.sent,
      ),
    [channelID, messages],
  );
  const latestMessageID = useMemo(
    () => channelMessages.find((m) => !m.sendStatus)?.messageID,
    [channelMessages],
  );

  const lastMessage = channelMessages[channelMessages.length - 1];
  const hasMore = lastMessage?.messageType !== MessageType.ChannelStart;

  const scrollToTop = () => scrollRef.current?.scrollTo({ left: 0, top: 0 });
  const onSubmit = () => {
    scrollToTop();
    submitNewMessage(inputRef, uid, dispatchBubble, channel, io);
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = '';
    }

    setSelectUserID(undefined);
    setShowChatInfo(false);
    setShowLeaving(false);
    inputRef.current?.focus();
    scrollToTop();
  }, [channelID]);

  useEffect(() => {
    if (isDM && !dmUser) {
      fetchUser(getDMUid(channel, uid), undefined, dispatchBubble, io);
    }
  }, [channel, dispatchBubble, dmUser, io, isDM, uid]);

  useEffect(() => {
    if (allReadInView) {
      dispatchBubble({
        type: 'updateMessageReadInfo',
        localReadInfo:
          latestMessageID !== undefined
            ? { [channelID]: latestMessageID }
            : undefined,
        localUnreadInfo: { [channelID]: 0 },
      });
    }
  }, [channelID, allReadInView, latestMessageID, dispatchBubble]);

  useEffect(() => {
    if (hasMore && loadingInView) {
      fetchMessages(channelID, lastMessage?.messageID, dispatchBubble, io);
    }
  }, [channelID, loadingInView, lastMessage, hasMore, dispatchBubble, io]);

  return (
    <div
      className="flex h-full w-full"
      onClick={() => {
        setShowChatInfo(false);
        setSelectUserID(undefined);
      }}
    >
      <div className="flex h-full w-full flex-col overflow-auto">
        <TitleBar
          title={title}
          onClick={() => setShowChatInfo(!showChatInfo)}
        />
        <DivideLine />

        <div className="relative flex w-full flex-grow flex-col overflow-y-auto overflow-x-hidden">
          <div
            ref={scrollRef}
            className="scrollbar-track-bg-neutral-200 flex flex-grow-0 flex-col-reverse gap-y-1
           overflow-y-auto overflow-x-hidden px-9 pb-3 scrollbar-thin scrollbar-thumb-neutral-300 
          "
          >
            <div
              key={'allRead'}
              ref={allReadRef}
              className="h-1 w-full flex-shrink-0"
            />

            {channelMessages.map((message, i) => (
              <MessageEntry
                key={message.id}
                message={message}
                isDM={isDM}
                dmUser={dmUser}
                clickPhoto={() => setSelectUserID(message.userID)}
              />
            ))}

            <div
              key={'loading'}
              ref={loadingRef}
              className={clsx(
                'flex h-16 w-full flex-shrink-0 items-center justify-center',
                { hidden: !hasMore },
              )}
            >
              <div className="relative h-5 w-5 animate-spin rounded-full border-2 border-neutral-400">
                <div className="absolute left-3/4 h-2/3 w-2/3 bg-gray-100"></div>
              </div>
            </div>
          </div>
          {!!selectUserID && (
            <div
              className="absolute mt-20 flex h-fit w-fit justify-center self-center rounded-md bg-white p-5 shadow-md"
              onClick={(e) => e.stopPropagation()}
            >
              <LoadUserProfile
                userID={selectUserID}
                onAction={{
                  clickMessage: () => {
                    inputRef.current?.focus();
                    setSelectUserID(undefined);
                  },
                }}
              />
            </div>
          )}

          {showLeaving && (
            <div
              className="absolute mt-20 flex h-fit w-fit justify-center self-center bg-white shadow-md"
              onClick={(e) => e.stopPropagation()}
            >
              <LeavingDialog
                channel={channel}
                dismiss={() => setShowLeaving(false)}
              />
            </div>
          )}
        </div>

        <DivideLine />
        <InputArea inputRef={inputRef} onSubmit={onSubmit} />
      </div>
      {showChatInfo && (
        <ChatInfo
          channel={channel}
          title={title}
          isDM={isDM}
          dmUser={dmUser}
          setSelectUserID={setSelectUserID}
          setShowLeaving={setShowLeaving}
        />
      )}
    </div>
  );
}

function TitleBar({ title, onClick }: { title: string; onClick: () => void }) {
  return (
    <div className="mx-8 flex h-14 flex-shrink-0 items-center justify-between">
      <button
        className="line-clamp-1 overflow-hidden text-ellipsis break-all text-xl font-medium"
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        {title}
      </button>
      <button className="ml-5">
        <EllipsisHorizontalIcon
          className="w-6 rounded-md hover:bg-gray-200"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        />
      </button>
    </div>
  );
}
