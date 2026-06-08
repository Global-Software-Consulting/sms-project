export default function AdminLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="from-primary to-accent h-10 w-10 animate-pulse rounded-xl bg-gradient-to-br" />
        <div className="bg-muted h-1 w-24 overflow-hidden rounded-full">
          <div className="bg-primary h-full w-1/2 animate-[shimmer_1.5s_infinite] rounded-full" />
        </div>
      </div>
    </div>
  );
}
