import {
  toRegisterRequest,
  validateLogin,
  validateRegister,
} from '../src/auth/validation';

describe('frontend validation mirrors backend rules', () => {
  it('rejects short passwords and invalid years', () => {
    expect(
      validateRegister({
        name: 'Ada',
        email: 'ada@campus.edu',
        password: 'short',
        institutionName: 'Example',
        major: 'CS',
        year: 'Junior',
      }),
    ).toBe('password must be at least 8 characters');
    expect(
      validateRegister({
        name: 'Ada',
        email: 'ada@campus.edu',
        password: 'password12',
        institutionName: 'Example',
        major: 'CS',
        year: 'First',
      }),
    ).toBe('year must be Freshman, Sophomore, Junior, Senior, or Graduate');
  });

  it('builds a camelCase register payload the API accepts', () => {
    const body = toRegisterRequest({
      name: 'Ada',
      email: 'ada@campus.edu',
      password: 'password12',
      institutionName: 'Example University',
      major: 'Computer Science',
      year: 'Junior',
    });
    expect(body).toMatchObject({
      institutionName: 'Example University',
      year: 'Junior',
      availability: [
        { dayOfWeek: 0, startTime: '17:00', timezone: 'America/Chicago' },
      ],
      groupPreferences: {
        preferredGroupSizeMin: 3,
        sessionDurationMinutes: 90,
      },
    });
  });

  it('does not invent a successful login for an invalid email', () => {
    expect(validateLogin('not-an-email', 'password12')).toBe(
      'email is invalid',
    );
  });
});
