import clsx from "clsx";

export function UnreadCount({ count }: { count?: number }) {
  if (!count || count === 0) {
    return <></>;
  }
  const is2digits = count > 9 && count < 100;
  const is3digits = count > 99;
  const text = is3digits ? '99+' : count;
  return (
    <span
      className={clsx(
        'absolute -right-2 -top-2 w-4 content-center rounded-full bg-red-500 text-center text-xs text-white',
        {
          'w-6': is2digits,
          'w-7': is3digits,
        },
      )}
    >
      {text}
    </span>
  );
}
