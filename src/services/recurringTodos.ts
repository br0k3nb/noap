import api from "./api";

import {
  activityOccurrenceKey,
  occurrenceDoneDate,
  resetChecklistState,
} from "./activityNotifications";

/**
 * Rollover + completion plumbing for notes linked to activities as recurring
 * todo lists. Two moments reset a linked note's checkboxes (unchecking every
 * Lexical checklist item, keeping text/order/structure):
 *
 *  1. The user marks the occurrence done ("Mark done") — `completeLinkedNote`
 *     records `doneDates` on the backend first, then resets the note so the
 *     same list is fresh for tomorrow.
 *  2. A new occurrence arrives while the note still shows the old one — the
 *     background scheduler calls `rolloverLinkedNoteIfNeeded`, which resets
 *     exactly once per occurrence per activity (tracked server-side in
 *     `seenOccurrences`, deduped via `$addToSet`).
 */

export type LinkedNoteResetResult = {
  reset: boolean;
  resetCount: number;
  occurrenceKey: string;
};

async function fetchNoteState(noteId: string): Promise<{
  noteId: string;
  stateId: string;
  stateJson: string;
  body: string;
  image: string;
} | null> {
  try {
    const {
      data: { note },
    } = await api.get(`/note/${noteId}`);
    const stateJson: string | undefined = note?.state?.state;
    const stateId: string | undefined = note?.state?._id;
    if (!stateJson || !stateId) return null;
    return {
      noteId: note._id,
      stateId,
      stateJson,
      body: note.body ?? "",
      image: note.image ?? "",
    };
  } catch {
    return null;
  }
}

async function saveResetState(args: {
  noteId: string;
  stateId: string;
  body: string;
  image: string;
  stateJson: string;
}): Promise<boolean> {
  try {
    await api.patch("/edit", {
      body: args.body,
      image: args.image,
      state: args.stateJson,
      _id: args.noteId,
      stateId: args.stateId,
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Resets the linked note's checkboxes when the scheduler sees an occurrence
 * it has never rolled over before. The first-ever sighting only establishes
 * the baseline (`seen` without reset) so creating a link never wipes a fresh
 * checklist on the spot.
 */
export async function rolloverLinkedNoteIfNeeded(
  activity: Activity,
  now: Date = new Date()
): Promise<LinkedNoteResetResult> {
  const noteId = activity.noteId;
  const empty: LinkedNoteResetResult = {
    reset: false,
    resetCount: 0,
    occurrenceKey: "",
  };
  if (!noteId) return empty;

  const occurrenceKey = activityOccurrenceKey(activity, now);
  if (!occurrenceKey) return empty;
  const seen = activity.seenOccurrences ?? [];

  const markSeen = async () => {
    try {
      await api.post(`/activity/seen/${activity._id}`, { occurrenceKey });
    } catch {
      /* best-effort bookkeeping */
    }
  };

  // Baseline: remember the current occurrence so the *next* one counts as
  // new. No reset — the user just linked this note.
  if (!seen.length) {
    await markSeen();
    return { reset: false, resetCount: 0, occurrenceKey };
  }
  if (seen.includes(occurrenceKey)) return { reset: false, resetCount: 0, occurrenceKey };

  const note = await fetchNoteState(noteId);
  if (!note) {
    // Note gone (deleted on another device): still advance `seen` so we do
    // not retry every tick. `note.delete` already unlinks server-side, the
    // refetch will drop the stale `noteId` shortly after.
    await markSeen();
    return { reset: false, resetCount: 0, occurrenceKey };
  }

  const { stateJson, resetCount, changed } = resetChecklistState(note.stateJson);
  if (changed) await saveResetState({ ...note, stateJson });
  await markSeen();
  return { reset: changed, resetCount, occurrenceKey };
}

/**
 * "The user answered the attached note": records the occurrence in
 * `doneDates` (drives the streak), then resets the note's checkboxes so the
 * list is reusable tomorrow. `doneDates` is written first — a reset must
 * never happen without the completion being stored.
 */
export async function completeLinkedNote(
  activity: Activity,
  now: Date = new Date()
): Promise<{ date: string; resetCount: number }> {
  const date = occurrenceDoneDate(activity, now);
  await api.post(`/activity/complete/${activity._id}`, { date });

  const noteId = activity.noteId;
  if (!noteId) return { date, resetCount: 0 };

  const note = await fetchNoteState(noteId);
  if (!note) return { date, resetCount: 0 };
  const { stateJson, resetCount, changed } = resetChecklistState(note.stateJson);
  if (changed) await saveResetState({ ...note, stateJson });
  return { date, resetCount };
}
