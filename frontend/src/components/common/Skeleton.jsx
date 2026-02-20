import clsx from 'clsx';
import { motion } from 'framer-motion';

export const Skeleton = ({ className }) => (
  <div className={clsx('skeleton', className)} />
);

export const SkeletonCard = () => (
  <div className="card p-4 space-y-3">
    <div className="flex items-center gap-3">
      <Skeleton className="w-10 h-10 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-3 w-3/4" />
    <div className="flex gap-2">
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  </div>
);

export const SkeletonList = ({ count = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }, (_, i) => <SkeletonCard key={i} />)}
  </div>
);

export const SkeletonStats = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {Array.from({ length: 4 }, (_, i) => (
      <div key={i} className="card p-4 space-y-2">
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
    ))}
  </div>
);
