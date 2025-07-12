import { Skeleton } from "@/components/ui/skeleton";

export default function ProductGallerySkeleton() {
  return (
    <div className="space-y-4">
      {/* Skeleton untuk Gambar Utama */}
      <Skeleton className="h-96 lg:h-[500px] w-full rounded-lg" />
      
      {/* Skeleton untuk Thumbnail Carousel */}
      <div className="flex -ml-2">
        {/* Buat 4 atau 5 placeholder thumbnail */}
        {[...Array(4)].map((_, index) => (
          <div className="flex-[0_0_25%] sm:flex-[0_0_20%] pl-2" key={index}>
            <Skeleton className="w-full aspect-square rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
