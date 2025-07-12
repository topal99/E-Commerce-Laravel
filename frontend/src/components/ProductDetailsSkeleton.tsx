import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetailsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* Skeleton untuk Judul & Rating */}
      <div>
        <Skeleton className="h-10 w-3/4" />
        <div className="flex items-center gap-4 mt-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>

      {/* Skeleton untuk Harga */}
      <Skeleton className="h-9 w-1/3" />

      {/* Skeleton untuk Deskripsi */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>

      {/* Skeleton untuk Tombol Aksi */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-12 w-full flex-grow" />
      </div>
    </div>
  );
}