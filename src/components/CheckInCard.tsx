import React from "react";
import { supabase } from "../lib/supabaseClient";

type Props = {
  onSaved: () => void;
  lastBlockEnd?: string;
};

type OccupationRow = {
  id: string;
  task: string;
  activityName: string;
};

function toLocalInputValue(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function makeRowId() {
  return `row_${Math.random().toString(36).slice(2, 9)}`;
}

export const CheckInCard: React.FC<Props> = ({ onSaved, lastBlockEnd }) => {
  const [startInput, setStartInput] = React.useState("");
  const [endInput, setEndInput] = React.useState("");
  const [feeling, setFeeling] = React.useState<number>(0);
  const [rows, setRows] = React.useState<OccupationRow[]>([
    { id: makeRowId(), task: "", activityName: "" },
  ]);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const now = new Date();
    const suggestedStart = lastBlockEnd
      ? new Date(lastBlockEnd)
      : new Date(now.getTime() - 30 * 60 * 1000);

    setStartInput(toLocalInputValue(suggestedStart));
    setEndInput(toLocalInputValue(now));
  }, [lastBlockEnd]);

  const updateRow = (id: string, field: keyof OccupationRow, value: string) => {
    setRows((current) =>
      current.map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      )
    );
  };

  const addRow = () => {
    setRows((current) => [...current, { id: makeRowId(), task: "", activityName: "" }]);
  };

  const removeRow = (id: string) => {
    setRows((current) => {
      if (current.length === 1) return current;
      return current.filter((row) => row.id !== id);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      const startDate = new Date(startInput);
      const endDate = new Date(endInput);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error("Please provide valid start and end times.");
      }
      if (endDate <= startDate) {
        throw new Error("End time must be after start time.");
      }

      const nonEmptyRows = rows.filter(
        (row) => row.task.trim().length > 0 || row.activityName.trim().length > 0
      );

      if (!nonEmptyRows.length) {
        throw new Error("Add at least one occupation (task + activity).");
      }

      const { data: block, error: blockError } = await supabase
        .from("time_blocks")
        .insert({
          start_time: startDate.toISOString(),
          end_time: endDate.toISOString(),
          feeling,
        })
        .select()
        .single();

      if (blockError) throw blockError;

      for (const row of nonEmptyRows) {
        const task = row.task.trim();
        const activityName =
          row.activityName.trim().length > 0
            ? row.activityName.trim()
            : "Uncategorised";

        if (!task) {
          // Skip rows without a task description.
          continue;
        }

        // Find or create Activity by name for this user.
        const { data: existingActivities, error: findError } = await supabase
          .from("activities")
          .select("*")
          .eq("name", activityName)
          .limit(1);

        if (findError) throw findError;

        let activityId: string;

        if (existingActivities && existingActivities.length > 0) {
          activityId = existingActivities[0].id;
        } else {
          const { data: newActivity, error: insertActivityError } = await supabase
            .from("activities")
            .insert({ name: activityName })
            .select()
            .single();

          if (insertActivityError) throw insertActivityError;
          activityId = newActivity.id;
        }

        const { error: occError } = await supabase.from("occupations").insert({
          time_block_id: block.id,
          task,
          activity_id: activityId,
        });

        if (occError) throw occError;
      }

      // Reset form (keep feeling, reset rows).
      setRows([{ id: makeRowId(), task: "", activityName: "" }]);
      const now = new Date();
      setStartInput(toLocalInputValue(now));
      setEndInput(toLocalInputValue(now));
      onSaved();
    } catch (err: any) {
      console.error("[CheckInCard] Failed to save check‑in", err);
      setError(err.message ?? "Failed to save check‑in.");
    } finally {
      setIsSaving(false);
    }
  };

  const feelings = [-2, -1, 0, 1, 2];

  return (
    <section className="bg-slate-900 border border-slate-700 rounded-xl p-4 text-xs">
      <h2 className="text-sm font-semibold mb-2">Check in</h2>
      <p className="text-xs text-slate-400 mb-3">
        Start and end a block, add what you were doing, and capture how you
        felt.
      </p>
      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-2">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-slate-300">Start</span>
            <input
              type="datetime-local"
              className="bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-xs"
              value={startInput}
              onChange={(e) => setStartInput(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-slate-300">End</span>
            <input
              type="datetime-local"
              className="bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-xs"
              value={endInput}
              onChange={(e) => setEndInput(e.target.value)}
            />
          </label>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[11px] text-slate-300">Occupations</span>
          {rows.map((row, index) => (
            <div key={row.id} className="grid grid-cols-[1fr,1fr,auto] gap-2">
              <input
                type="text"
                className="bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-xs"
                placeholder="Task (e.g. Research competitors)"
                value={row.task}
                onChange={(e) => updateRow(row.id, "task", e.target.value)}
              />
              <input
                type="text"
                className="bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-xs"
                placeholder="Activity (e.g. Deep work)"
                value={row.activityName}
                onChange={(e) =>
                  updateRow(row.id, "activityName", e.target.value)
                }
              />
              <button
                type="button"
                className="px-2 py-1 text-[11px] rounded-md border border-slate-700 text-slate-300"
                onClick={() => removeRow(row.id)}
                disabled={rows.length === 1}
              >
                {rows.length === 1 ? "–" : "Remove"}
              </button>
            </div>
          ))}
          <button
            type="button"
            className="self-start mt-1 px-2 py-1 text-[11px] rounded-md border border-slate-600 text-slate-200"
            onClick={addRow}
          >
            + Add occupation
          </button>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[11px] text-slate-300">Feeling</span>
          <div className="inline-flex gap-1">
            {feelings.map((value) => (
              <button
                key={value}
                type="button"
                className={`px-2 py-1 rounded-md border text-[11px] ${
                  feeling === value
                    ? "border-sky-400 bg-sky-950 text-sky-100"
                    : "border-slate-600 bg-slate-950 text-slate-300"
                }`}
                onClick={() => setFeeling(value)}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-[11px] text-red-400">
            {error}
          </p>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-3 py-1.5 rounded-md bg-sky-500 disabled:bg-sky-900 text-xs font-semibold text-slate-950"
          >
            {isSaving ? "Saving…" : "Save block"}
          </button>
        </div>
      </form>
    </section>
  );
};
