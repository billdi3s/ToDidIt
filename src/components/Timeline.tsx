import React from "react";
import type { TimeBlock, Occupation } from "../types/time";
import type { Gap } from "../hooks/useTimeBlocks";
import { GapDivider } from "./GapDivider";
import { TimeBlockCard } from "./TimeBlockCard";

type Props = {
  blocks: TimeBlock[];
  occupationsByBlockId: Record<string, Occupation[]>;
  gaps: Gap[];
};

export const Timeline: React.FC<Props> = ({
  blocks,
  occupationsByBlockId,
  gaps,
}) => {
  if (!blocks.length) {
    return (
      <section className="border border-slate-800 rounded-xl p-4 text-xs text-slate-400">
        No time blocks for today yet. Use the check‑in card above to log your
        first block.
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-2">
      {blocks.map((block) => {
        const blockOccupations = occupationsByBlockId[block.id] ?? [];
        const followingGap = gaps.find((gap) => gap.fromBlockId === block.id);

        return (
          <React.Fragment key={block.id}>
            <TimeBlockCard block={block} occupations={blockOccupations} />
            {followingGap && <GapDivider gap={followingGap} />}
          </React.Fragment>
        );
      })}
    </section>
  );
};
