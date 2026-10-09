import { VALID_YEARS, type RegisterRequest } from '../api/types';

export function validateLogin(email: string, password: string): string | null {
  if (!email.trim() || !email.includes('@') || email.trim().length > 254) {
    return 'email is invalid';
  }
  if (!password) {
    return 'password is required';
  }
  return null;
}

export function validateRegister(input: {
  name: string;
  email: string;
  password: string;
  institutionName: string;
  major: string;
  year: string;
}): string | null {
  if (!input.name.trim()) {
    return 'name is required';
  }
  if (
    !input.email.trim() ||
    !input.email.includes('@') ||
    input.email.trim().length > 254
  ) {
    return 'email is invalid';
  }
  if (input.password.length < 8) {
    return 'password must be at least 8 characters';
  }
  if (input.password.length > 128) {
    return 'password is too long';
  }
  if ([...input.password].some(ch => ch.charCodeAt(0) < 32)) {
    return 'password contains invalid characters';
  }
  if (!input.institutionName.trim()) {
    return 'institutionName is required';
  }
  if (!input.major.trim()) {
    return 'major is required';
  }
  if (!(VALID_YEARS as readonly string[]).includes(input.year)) {
    return 'year must be Freshman, Sophomore, Junior, Senior, or Graduate';
  }
  return null;
}

export function toRegisterRequest(input: {
  name: string;
  email: string;
  password: string;
  institutionName: string;
  major: string;
  year: string;
}): RegisterRequest {
  return {
    name: input.name.trim(),
    email: input.email.trim(),
    password: input.password,
    institutionName: input.institutionName.trim(),
    major: input.major.trim(),
    year: input.year,
    studyEnvironments: ['Library'],
    studyMethods: ['Practice problems'],
    subjects: ['Algorithms'],
    availability: [
      {
        dayOfWeek: 0,
        startTime: '17:00',
        endTime: '21:00',
        timezone: 'America/Chicago',
      },
    ],
    performanceLevel: 3,
    groupPreferences: {
      preferredGroupSizeMin: 3,
      preferredGroupSizeMax: 5,
      sessionDurationMinutes: 90,
      studyGoals: ['Exam preparation'],
    },
  };
}
