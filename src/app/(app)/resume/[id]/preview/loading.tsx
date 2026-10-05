import { Skeleton } from "@/components/ui/skeleton";

export default function PreviewLoading() {
  return (
    <div className="min-h-dvh bg-canvas" aria-busy="true" aria-label="Loading preview">
      <div className="flex h-16 items-center gap-3 border-b border-border bg-background px-4">
        <Skeleton className="size-9" />
        <Skeleton className="h-5 w-48" />
        <Skeleton className="ml-auto h-10 w-36" />
      </div>
      <div className="px-4 py-8">
        <Skeleton className="mx-auto aspect-[210/297] w-full max-w-[820px] bg-card" />
      </div>
    </div>
  );
}
