import { RefObject } from 'react';

export function InputArea({
  inputRef,
  onSubmit,
}: {
  inputRef: RefObject<HTMLTextAreaElement>;
  onSubmit: () => void;
}) {
  return (
    <div className="flex h-36 w-full flex-shrink-0 flex-col justify-between pr-5 pt-2">
      <textarea
        name={'message'}
        ref={inputRef}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSubmit();
          }
        }}
        autoFocus={true}
        className="scrollbar-track-bg-neutral-200 h-20 w-full resize-none appearance-none overflow-y-auto border-transparent bg-gray-100 pb-4 pl-5 scrollbar-thin scrollbar-thumb-neutral-300 focus:border-transparent focus:ring-0"
      />
      <div
        className="mb-4 self-end rounded-md bg-neutral-200 px-6 py-2 text-sm font-medium text-green-600 transition-colors aria-disabled:cursor-not-allowed aria-disabled:opacity-50 hover:bg-neutral-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-400 active:bg-neutral-200"
        onClick={onSubmit}
      >
        Send
      </div>
    </div>
  );
}
