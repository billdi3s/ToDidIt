import React from "react";
import type { TimeBlock, Occupation } from "../types/time";

type Props = {
  block: TimeBlock;
  occupations: Occupation[];
};

const feelingLabels: Record<number, string> = {
  [-2]: "Very low",
  [-1]: "Low",
  0: "Neutral",
  1: "Good",
  2: "Great",
};

export const TimeBlockCard: React.FC<Props> = ({ block, occupations }) => {
  const start = new Date(block.startTime).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const end = new Date(block.endTime).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const feelingLabel = feelingLabels[block.feeling] ?? "Unknown";

  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <div className="font-medium text-slate-100">
          {start} – {end}
        </div>
        <div className="inline-flex items-center gap-1 rounded-full border border-slate-700 px-2 py-0.5 text-[10px]">
          <span className="font-semibold">{block.feeling}</span>
          <span className="text-slate-400">{feelingLabel}</span>
        </div>
      </div>
      {occupations.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {occupations.map((occ) => (
            <span
              key={occ.id}
              className="inline-flex items-center gap-1 rounded-full border border-slate-700 px-2 py-0.5"
            >
              <span className="text-slate-200">{occ.task}</span>
            </span>
          ))}
        </div>
      )}
    </article>
  );
};
