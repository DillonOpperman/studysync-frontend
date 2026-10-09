import type { AvailabilityInput, CreateGroupRequest } from '../../api/types';

const CLOCK = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/;
const IANA = /^[A-Za-z_]+(?:\/[A-Za-z0-9_+-]+)+$|^UTC$/;

export type CreateGroupDraft = {
  title: string;
  subject: string;
  description: string;
  location: string;
  maxMembers: string;
  courseId?: string;
  includeSchedule: boolean;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone: string;
};

export type CreateGroupErrors = Partial<
  Record<
    | 'title'
    | 'subject'
    | 'maxMembers'
    | 'startTime'
    | 'endTime'
    | 'timezone'
    | 'form',
    string
  >
>;

export function validateCreateGroup(draft: CreateGroupDraft): {
  errors: CreateGroupErrors;
  request?: CreateGroupRequest;
} {
  const errors: CreateGroupErrors = {};
  if (!draft.title.trim()) {
    errors.title = 'title is required';
  }
  if (!draft.subject.trim()) {
    errors.subject = 'subject is required';
  }
  const maxMembers = Number.parseInt(draft.maxMembers, 10);
  if (!Number.isFinite(maxMembers) || maxMembers < 2 || maxMembers > 50) {
    errors.maxMembers = 'maxMembers must be between 2 and 50';
  }

  let slots: AvailabilityInput[] = [];
  if (draft.includeSchedule) {
    if (!(draft.dayOfWeek >= 0 && draft.dayOfWeek <= 6)) {
      errors.form = 'dayOfWeek must be between 0 (Monday) and 6 (Sunday)';
    }
    if (!CLOCK.test(draft.startTime.trim())) {
      errors.startTime = 'startTime must be HH:MM or HH:MM:SS';
    }
    if (!CLOCK.test(draft.endTime.trim())) {
      errors.endTime = 'endTime must be HH:MM or HH:MM:SS';
    }
    if (
      draft.startTime.trim() &&
      draft.startTime.trim() === draft.endTime.trim()
    ) {
      errors.endTime =
        'endTime must differ from startTime (zero-length windows are not allowed)';
    }
    if (!draft.timezone.trim()) {
      errors.timezone = 'timezone is required';
    } else if (!IANA.test(draft.timezone.trim())) {
      errors.timezone = 'timezone must be a valid IANA name';
    }
    if (
      !errors.startTime &&
      !errors.endTime &&
      !errors.timezone &&
      !errors.form
    ) {
      slots = [
        {
          dayOfWeek: draft.dayOfWeek,
          startTime: draft.startTime.trim(),
          endTime: draft.endTime.trim(),
          timezone: draft.timezone.trim(),
        },
      ];
    }
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const request: CreateGroupRequest = {
    title: draft.title.trim(),
    subject: draft.subject.trim(),
    description: draft.description.trim(),
    location: draft.location.trim(),
    maxMembers,
    recurringSlots: slots,
  };
  if (draft.courseId) {
    request.courseId = draft.courseId;
  }
  return { errors: {}, request };
}

export function formatWeekday(dayOfWeek: number): string {
  const names = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];
  return names[dayOfWeek] ?? `Day ${dayOfWeek}`;
}

export function formatClock(value: string): string {
  return value.length >= 5 ? value.slice(0, 5) : value;
}

export function formatSlot(slot: {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone: string;
}): string {
  return `${formatWeekday(slot.dayOfWeek)} ${formatClock(
    slot.startTime,
  )}–${formatClock(slot.endTime)} (${slot.timezone})`;
}
