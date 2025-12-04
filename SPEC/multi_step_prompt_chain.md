# Multi‑step Prompt Chain – 2done+1 / ToDone Time Canvas

You **must not skip steps**. After each step you must stop, show the result,
and ask for explicit approval before moving on.

## Step 1 – Project Definition

**Inputs**

- `/SPEC/psd.md`
- `/SPEC/system_prompt.md`
- `/SPEC/roadmap.md` (for context only)

**Outputs**

- Clear restatement of:
  - Core concept and problem.
  - Entities and relationships.
  - In‑scope and out‑of‑scope features for the MVP.
- List of assumptions and open questions.

End with: `Ready for approval for Step 1.`

---

## Step 2 – Data Architecture

**Inputs**

- Step 1 output.
- `/supabase/schema.sql`
- `/supabase/policies.sql`
- `/src/types/time.ts`

**Tasks**

- Check that the logical data model in the PSD maps cleanly to the Supabase schema.
- Call out any gaps or inconsistencies (naming, types, nullability, indexes).
- Propose minimal schema tweaks if needed, but do not change the files until approved.

**Outputs**

- Short description of each table and relationship.
- A bullet list of “no changes required” vs “recommended changes”.
- If changes are approved later, an updated `schema.sql` / `policies.sql` diff.

End with: `Ready for approval for Step 2.`

---

## Step 3 – UI/UX Architecture

**Inputs**

- `/SPEC/ui_wireframes.txt`
- `/SPEC/architecture_diagrams.txt`
- Existing components under `/src/components` and hooks in `/src/hooks`.

**Tasks**

- Define the screen map for the MVP (Auth / Today Time Canvas).
- Define the component hierarchy and props for:
  - `TimeCanvasPage`
  - `CheckInCard`
  - `Timeline`
  - `TimeBlockCard`
  - `GapDivider`
- Describe state flow: what lives where, how data and actions move through the tree.

**Outputs**

- A written “architecture diagram” in text.
- A list of components and hooks with their responsibilities and props.

End with: `Ready for approval for Step 3.`

---

## Step 4 – Component Scaffolding

**Inputs**

- Approved UI/UX architecture.
- Current component files.

**Tasks**

- Generate or refine component and hook **structure** without fully wiring Supabase.
- Keep logic thin; focus on clear props, layout, and data shapes.
- Ensure TypeScript compiles and the app renders with static or fake data
  if Supabase is not configured.

**Outputs**

- Updated React components and hooks.
- Brief explanation of what changed in which files.

End with: `Ready for approval for Step 4.`

---

## Step 5 – Functional Logic Integration

**Inputs**

- Existing scaffolds from Step 4.
- `/src/lib/supabaseClient.ts`
- `/supabase/schema.sql` (for field names).

**Tasks**

- Wire `useTimeBlocks(dateIso)` to Supabase:
  - Load `time_blocks` for the day.
  - Load `occupations` for those blocks.
  - Compute derived `gaps` between adjacent blocks.
- Wire `CheckInCard` to create new `time_blocks`, `activities`, and `occupations` rows.
- Handle loading and error states.

**Outputs**

- Updated hooks and components with real data plumbing.
- Short description of API usage (tables, filters, ordering).

End with: `Ready for approval for Step 5.`

---

## Step 6 – Final Assembly

**Tasks**

- Do a clarity pass over the code (naming, duplication, comments).
- Add concise comments where future you / future models need context.
- Summarise what the MVP can do and list 3–5 concrete next steps from the roadmap.

**Outputs**

- Brief changelog.
- “How to extend this next” notes.

End with: `Ready for approval for Step 6.`
