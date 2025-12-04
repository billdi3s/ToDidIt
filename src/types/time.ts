export type TimeBlockId = string;
export type OccupationId = string;
export type ActivityId = string;

export type TimeBlock = {
  id: TimeBlockId;
  userId: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  feeling: number;   // -2 to +2
  createdAt: string;
  updatedAt: string;
};

export type Occupation = {
  id: OccupationId;
  userId: string;
  timeBlockId: TimeBlockId;
  task: string;       // Freeform description
  activityId: ActivityId;
  createdAt: string;
  updatedAt: string;
};

export type Activity = {
  id: ActivityId;
  userId: string;
  name: string;       // e.g. "YouTube Shorts"
  createdAt: string;
  updatedAt: string;
};
