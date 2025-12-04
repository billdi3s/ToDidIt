import React from "react";
import type { Gap } from "../hooks/useTimeBlocks";

type Props = {
  gap: Gap;
};

export const GapDivider: React.FC<Props> = ({ gap }) => {
  if (gap.durationMinutes <= 0) return null;

  return (
    <div className="flex items-center gap-2 my-1">
      <div className="flex-1 border-t border-dashed border-slate-700" />
      <span className="text-[10px] text-slate-500 whitespace-nowrap">
        Unaccounted time: {Math.round(gap.durationMinutes)} min
      </span>
      <div className="flex-1 border-t border-dashed border-slate-700" />
    </div>
  );
};
