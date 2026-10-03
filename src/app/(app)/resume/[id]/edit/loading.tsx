import { Skeleton } from "@/components/ui/skeleton";

export default function EditorLoading() {
  return (
    <div className="flex h-dvh flex-col" aria-busy="true" aria-label="Loading editor">
      <div className="flex h-16 items-center gap-3 border-b border-border px-4">
        <Skeleton className="size-9" />
        <Skeleton className="h-5 w-48" />
        <Skeleton className="ml-auto h-10 w-36" />
      </div>
      <div className="flex-1 lg:grid lg:grid-cols-[420px_1fr_300px]">
        <div className="space-y-2 p-4">
          {Array.from({ length: 7 }, (_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
        <div className="hidden bg-canvas p-8 lg:block">
          <Skeleton className="mx-auto aspect-[210/297] w-full max-w-[820px] bg-card" />
        </div>
        <div className="hidden p-4 lg:block">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  );
}
