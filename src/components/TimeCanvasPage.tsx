import React from "react";
import { useTimeBlocks } from "../hooks/useTimeBlocks";
import { Timeline } from "./Timeline";
import { CheckInCard } from "./CheckInCard";
import { useAuth } from "../context/AuthProvider";

export const TimeCanvasPage: React.FC = () => {
  const { logout } = useAuth();

  const todayIso = new Date().toISOString().slice(0, 10);
  const { blocks, occupationsByBlockId, gaps, isLoading, error, reload } =
    useTimeBlocks(todayIso);

  const lastBlockEnd =
    blocks.length > 0 ? blocks[blocks.length - 1].endTime : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50">
      <header className="p-4 border-b border-slate-800 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold">2done+1 Time Canvas</h1>
          <p className="text-xs text-slate-400">Daily activity audit</p>
          <p className="text-[10px] text-slate-500 mt-1">
            {todayIso}
            {isLoading ? " · Loading…" : ""}
          </p>
          {error && (
            <p className="text-[10px] text-red-400 mt-1">
              {error}
            </p>
          )}
        </div>

        <button
          onClick={logout}
          className="text-xs bg-red-600 px-3 py-1 rounded hover:bg-red-700 transition"
        >
          Logout
        </button>
      </header>

      <main className="flex-1 flex flex-col gap-4 p-4">
        <CheckInCard onSaved={reload} lastBlockEnd={lastBlockEnd} />
        <Timeline
          blocks={blocks}
          occupationsByBlockId={occupationsByBlockId}
          gaps={gaps}
        />
      </main>
    </div>
  );
};
