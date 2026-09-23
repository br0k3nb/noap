declare type NoteData = {
  _id: string;
  userId: string;
  name: string;
  body: string;
  image?: string;
  state: {
    _id: string;
    state: string;
  };
  labels: [{
    _id: string;
    name: string;
    type: string;
    color: string;
    fontColor: string;
  }] | [];
  settings: {
    contributors?: string[];
    showBottomBar: boolean;
    readMode: boolean;
    expanded: boolean;
    shared: boolean;
    pinned: boolean;
    permissions?: string[];
    noteBackgroundColor?: string;
  };
  pageLocation?: string | number;
  updatedAt: string;
  createdAt: string;
};

declare type NoteMetadata = {
  readonly noteMetadata: {
    _id: string;
    userId: string;
    name?: string;
    body: string;
    image?: string;
    label: {
      _id: string;
      name: string;
      type: string;
      color: string;
      fontColor: string;
    };
    labelArraySize: number;
    settings: {
      shared: boolean;
      pinned: boolean;
      permissions?: string[];
      noteBackgroundColor?: string;
    };
    pageLocation: string | number;
    updatedAt: string;
    createdAt: string;
  }[];
};

declare type Labels = {
    readonly labels: {
      _id: string;
      userId: string;
      name: string;
      color: string;
      fontColor?: string;
      type: string;
      updatedAt?: string;
      createdAt: string;
    }[];
};

declare type Sessions = {
  readonly sessions: {
    _id: string;
    userId: string;
    /** Set by the backend for the session of the calling request. */
    current?: boolean;
    expAt: number;
    ip: string;
    browserData: string;
    location: string;
    countryFlag: string;
    deviceType: string;
    deviceData: {
      id: string;
      type: string;
      brand: string;
      model: string;
      code: string;
    };
    clientData: string;
    createdAt: string;
  }[];
};

declare type ActivityTrigger = {
  /** "HH:MM" (24h) — time of day the reminder fires (America/Recife). */
  time: string;
  /** "DD/MM/YYYY" — day of the one-shot "once" trigger. */
  date?: string;
  /** Reserved for a future "weekly" trigger: 0 (Sunday) - 6 (Saturday). */
  weekdays?: number[];
};

declare type Activity = {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  /** Recurrence kind of the trigger: "daily" today, more kinds later. */
  triggerType: string;
  trigger: ActivityTrigger;
  enabled: boolean;
  /**
   * Hex id of the note acting as this activity's recurring todo list.
   * When set, checking items off + "Mark done" records the current
   * occurrence, and the note resets its checkboxes at the next occurrence.
   */
  noteId?: string | null;
  /**
   * Occurrence keys already rolled over (checkboxes reset). "YYYY-MM-DD"
   * for daily, "DD/MM/YYYY" for once — newest last, deduped server-side.
   */
  seenOccurrences?: string[];
  /**
   * "DD/MM/YYYY" days the user marked done (answered the attached note).
   * Drives the streak + progress UI. Never shrinks, one entry per
   * occurrence (deduped server-side).
   */
  doneDates?: string[];
  /** RFC3339 timestamp of the last notification fired by any device. */
  lastTriggeredAt?: string;
  createdAt: string;
  updatedAt?: string;
};

declare type ActivityProgress = {
  noteId?: string | null;
  doneDates: string[];
  seenOccurrences: string[];
  currentStreak: number;
  totalCompletions: number;
  doneToday: boolean;
  today: string;
  lastDone?: string;
};

declare type Activities = {
  readonly activities: Activity[];
};