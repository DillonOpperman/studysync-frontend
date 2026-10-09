import { validateCreateGroup } from '../src/features/groups/validateCreate';

const base = {
  title: 'Algo night',
  subject: 'Algorithms',
  description: 'Weekly',
  location: 'Library',
  maxMembers: '6',
  includeSchedule: false,
  dayOfWeek: 0,
  startTime: '17:00',
  endTime: '21:00',
  timezone: 'America/Chicago',
};

describe('validateCreateGroup', () => {
  it('requires title, subject, and capacity 2–50', () => {
    expect(validateCreateGroup({ ...base, title: '  ' }).errors.title).toBe(
      'title is required',
    );
    expect(validateCreateGroup({ ...base, subject: '' }).errors.subject).toBe(
      'subject is required',
    );
    expect(
      validateCreateGroup({ ...base, maxMembers: '1' }).errors.maxMembers,
    ).toBe('maxMembers must be between 2 and 50');
  });

  it('builds the camelCase create payload without fabricated fields', () => {
    const { request, errors } = validateCreateGroup(base);
    expect(errors).toEqual({});
    expect(request).toEqual({
      title: 'Algo night',
      subject: 'Algorithms',
      description: 'Weekly',
      location: 'Library',
      maxMembers: 6,
      recurringSlots: [],
    });
    expect(request).not.toHaveProperty('courseCode');
  });

  it('accepts overnight slots when end is earlier than start', () => {
    const { request, errors } = validateCreateGroup({
      ...base,
      includeSchedule: true,
      startTime: '22:00',
      endTime: '01:30',
    });
    expect(errors).toEqual({});
    expect(request?.recurringSlots).toEqual([
      {
        dayOfWeek: 0,
        startTime: '22:00',
        endTime: '01:30',
        timezone: 'America/Chicago',
      },
    ]);
  });

  it('rejects zero-length windows and non-IANA timezones', () => {
    expect(
      validateCreateGroup({
        ...base,
        includeSchedule: true,
        startTime: '17:00',
        endTime: '17:00',
      }).errors.endTime,
    ).toMatch(/zero-length/);
    expect(
      validateCreateGroup({
        ...base,
        includeSchedule: true,
        timezone: 'Central',
      }).errors.timezone,
    ).toMatch(/IANA/);
  });
});
