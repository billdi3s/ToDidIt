import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import type { TimeBlock, Occupation } from "../types/time";

export type Gap = {
  id: string;
  fromBlockId: string;
  toBlockId: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
};

type UseTimeBlocksResult = {
  blocks: TimeBlock[];
  occupationsByBlockId: Record<string, Occupation[]>;
  gaps: Gap[];
  isLoading: boolean;
  error: string | null;
  reload: () => void;
};

function mapBlockRow(row: any): TimeBlock {
  return {
    id: row.id,
    userId: row.user_id,
    startTime: row.start_time,
    endTime: row.end_time,
    feeling: row.feeling,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapOccupationRow(row: any): Occupation {
  return {
    id: row.id,
    userId: row.user_id,
    timeBlockId: row.time_block_id,
    task: row.task,
    activityId: row.activity_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function useTimeBlocks(dateIso: string): UseTimeBlocksResult {
  const [blocks, setBlocks] = useState<TimeBlock[]>([]);
  const [occupationsByBlockId, setOccupationsByBlockId] = useState<
    Record<string, Occupation[]>
  >({});
  const [gaps, setGaps] = useState<Gap[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const startOfDayLocal = new Date(`${dateIso}T00:00:00`);
      const endOfDayLocal = new Date(`${dateIso}T23:59:59.999`);

      const { data: blockRows, error: blockError } = await supabase
        .from("time_blocks")
        .select("*")
        .gte("start_time", startOfDayLocal.toISOString())
        .lte("start_time", endOfDayLocal.toISOString())
        .order("start_time", { ascending: true });

      if (blockError) throw blockError;

      const mappedBlocks = (blockRows ?? []).map(mapBlockRow);
      setBlocks(mappedBlocks);

      if (!mappedBlocks.length) {
        setOccupationsByBlockId({});
        setGaps([]);
        return;
      }

      const blockIds = mappedBlocks.map((b) => b.id);

      const { data: occupationRows, error: occError } = await supabase
        .from("occupations")
        .select("*")
        .in("time_block_id", blockIds);

      if (occError) throw occError;

      const occs = (occupationRows ?? []).map(mapOccupationRow);
      const grouped: Record<string, Occupation[]> = {};

      for (const occ of occs) {
        if (!grouped[occ.timeBlockId]) grouped[occ.timeBlockId] = [];
        grouped[occ.timeBlockId].push(occ);
      }

      setOccupationsByBlockId(grouped);

      // Compute gaps
      const newGaps: Gap[] = [];
      for (let i = 0; i < mappedBlocks.length - 1; i++) {
        const current = mappedBlocks[i];
        const next = mappedBlocks[i + 1];
        const currentEnd = new Date(current.endTime);
        const nextStart = new Date(next.startTime);
        const diffMinutes = (nextStart.getTime() - currentEnd.getTime()) / 60000;

        if (diffMinutes > 0.5) {
          newGaps.push({
            id: `${current.id}__${next.id}`,
            fromBlockId: current.id,
            toBlockId: next.id,
            startTime: current.endTime,
            endTime: next.startTime,
            durationMinutes: diffMinutes,
          });
        }
      }

      setGaps(newGaps);
    } catch (err: any) {
      console.error("[useTimeBlocks] Failed to load time blocks", err);
      setError(err.message ?? "Failed to load time blocks.");
    } finally {
      setIsLoading(false);
    }
  }, [dateIso]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { blocks, occupationsByBlockId, gaps, isLoading, error, reload };
}
