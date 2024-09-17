interface FrameProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  children: React.ReactNode;
}

export function Frame({ title, children, ...rest }: FrameProps) {
  return (
    <div {...rest} className="flex h-full w-full flex-col overflow-auto">
      <div className="mx-8 flex h-14 flex-shrink-0 items-center">
        <div className="line-clamp-1 overflow-hidden text-ellipsis break-all text-xl font-medium">
          {title}
        </div>
      </div>
      <DivideLine />
      {children}
    </div>
  );
}

export function DivideLine() {
  return <div className="h-px w-full flex-shrink-0 bg-neutral-200" />;
}
