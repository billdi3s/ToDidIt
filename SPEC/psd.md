# Product Spec – 2done+1 / ToDone Time Canvas MVP

## 1. Concept

The **Time Canvas** is a daily view of how a single person spent their time and how they felt about it.

Instead of a calendar full of meetings, the user sees:

- **TimeBlocks** – contiguous spans of time (start, end, feeling)
- **Occupations** – rows inside a block describing what filled it (task + activity)
- **Activities** – reusable labels for time categories (e.g. “Deep work”, “YouTube Shorts”)
- **Gaps** – unaccounted time between blocks, derived in code (not stored)

The MVP is a mobile‑first web app that lets the user:

1. Sign in (via Supabase Auth).
2. “Check in” to log what they’ve been doing in a block of time.
3. See **today’s** canvas as a vertical list of blocks and gaps.
4. Quickly understand where the day went.

This is the **time layer** of a future personal OS, so the model must be clean and extensible.

## 2. User & Goals

Primary user: a single individual who wants a light‑weight, always‑available time audit.

They want to:

- Capture what they did and how they felt without heavy ceremony.
- See unaccounted gaps in the day.
- Build awareness and patterns over time (analytics come later).

The MVP optimises for **speed of capture** and **clarity of the daily view**.

## 3. In‑Scope Features (MVP)

### 3.1 Auth & Entry

- Supabase Auth (email magic link or OAuth).
- After sign‑in, the user lands on **Today’s Time Canvas**.

### 3.2 Today view – Time Canvas

Single mobile‑first screen.

- **Header**
  - App name (e.g. “2done+1 Time Canvas”).
  - Short subtitle (“Daily activity audit: blocks, gaps, occupations”).
  - Today’s date and a subtle loading indicator when data is fetching.

- **Check‑In Card**
  - Shows suggested start time based on the previous block’s `end_time`.
  - If no previous block: default to “now minus ~30 minutes”.
  - Fields:
    - Start time (`datetime-local`)
    - End time (`datetime-local`, default “now”)
    - One or more **Occupation rows**:
      - Task text (freeform)
      - Activity name (string; controlled list in the DB, chosen by name)
    - Feeling score (integer: ‑2, ‑1, 0, +1, +2)
  - On save:
    - Create a `time_blocks` row.
    - For each occupation row:
      - Ensure an `activities` row exists for the activity name (per‑user, by name).
      - Create one `occupations` row linking to the `time_block` and `activity`.
  - After save:
    - Clear the form to sensible defaults (e.g. keep feeling, reset tasks/activities).
    - Trigger a reload of Today’s canvas.

- **Timeline**
  - Shows TimeBlocks for **today** in ascending time order.
  - For each block:
    - Show `start_time – end_time`.
    - Show feeling score as a small pill with numeric + label.
    - Show each occupation’s task as a pill (activities can be surfaced later).
  - Between blocks:
    - If the gap between `end_time` of one block and `start_time` of the next is positive,
      render a **Gap** element.
    - Gaps are *derived* in code and not stored in the DB.

- **Empty state**
  - If there are no blocks for today:
    - Show a compact empty state (“No blocks yet. Use the Check‑In card above.”).

### 3.3 Editing (MVP‑light)

- Full editing UI is out of scope.
- Architecture and data model must support later add/edit/delete of blocks and occupations
  without major redesign.

## 4. Out of Scope (for this MVP)

- Multi‑day navigation and analytics.
- Tasks / projects beyond the simple `activities` table.
- Notes, journaling, or long‑form reflections.
- Multi‑user / teams.
- Calendar integrations or external data sources.

These are **future work**. The architecture should not block them, but we don’t ship them now.

## 5. Data Model (logical)

Entities (front‑end types; DB uses `snake_case`):

- **User**
  - `id`
  - `created_at`

- **Activity**
  - `id`
  - `user_id`
  - `name` (e.g. “YouTube Shorts”, “Deep work”)
  - `created_at`, `updated_at`

- **TimeBlock**
  - `id`
  - `user_id`
  - `start_time` (ISO timestamp)
  - `end_time` (ISO timestamp; must be > `start_time`)
  - `feeling` (int, ‑2..2)
  - `created_at`, `updated_at`

- **Occupation**
  - `id`
  - `user_id`
  - `time_block_id`
  - `task` (freeform description such as “Research competitors”)
  - `activity_id` (FK to Activity)
  - `created_at`, `updated_at`

- **Gap** (derived; not stored)
  - `from_block_id`
  - `to_block_id`
  - `start_time` = previous block `end_time`
  - `end_time` = next block `start_time`
  - `duration_minutes`

Key rules:

- All domain rows are per‑user and protected by row‑level security.
- TimeBlocks for a user on a given day do not have to cover the full day.
- Overlapping blocks are allowed for now (conflict validation is future work).

## 6. Technical Notes

- All times are stored in Supabase as `timestamptz` and sent/received as ISO strings.
- The front‑end treats `dateIso` (YYYY‑MM‑DD) as the *local* date for the user.
- The hook `useTimeBlocks(dateIso)` is the single entry point for loading blocks,
  occupations, and gaps for a given day.
- Supabase queries should rely on RLS and the `auth.uid()` defaults; the client does not need
  to send `user_id` explicitly.

## 7. Future – OS Foundation

As this grows into a broader OS, we will:

- Add analytics views (patterns of activities and feelings).
- Layer tasks, notes, and rituals on top of the Time Canvas.
- Support templates (morning check‑in, weekly review).
- Introduce multi‑user workspaces.

The current MVP should be a **clean foundation** that can be extended without major rewrites.
