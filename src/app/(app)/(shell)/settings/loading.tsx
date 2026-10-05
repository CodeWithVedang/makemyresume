import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading settings">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-4 w-72" />
      <div className="space-y-4 rounded-lg border border-border bg-card p-6">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}
