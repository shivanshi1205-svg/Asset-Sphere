import React from 'react';

export const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={`rounded-lg bg-slate-200 animate-pulse ${className}`}
      {...props}
    />
  );
};

export const KPICardSkeleton = () => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-xl" />
      </div>
      <div className="mt-4">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="mt-2 h-4 w-32" />
      </div>
    </div>
  );
};

export const TableRowSkeleton = ({ cols = 5 }) => {
  return (
    <div className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0 px-4">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={`h-4 ${i === 0 ? 'w-24' : i === 1 ? 'w-36' : 'w-16'}`} 
        />
      ))}
    </div>
  );
};

export const PropertyCardSkeleton = () => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-soft">
      <Skeleton className="h-48 w-full rounded-t-2xl rounded-b-none" />
      <div className="p-5">
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-16 rounded-full" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="h-6 w-3/4 mt-3" />
        <Skeleton className="h-4 w-1/2 mt-2" />
        <div className="mt-5 flex gap-4">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
        </div>
        <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16 rounded-lg" />
        </div>
      </div>
    </div>
  );
};
