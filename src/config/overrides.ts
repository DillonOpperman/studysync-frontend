/**
 * Optional API origin override. Leave `null` to use platform defaults
 * (Android emulator → 10.0.2.2, iOS simulator → 127.0.0.1).
 *
 * Physical device example: 'http://192.168.1.12:8080'
 * Do not commit production credentials. A LAN IP is fine for local debug.
 */
export const apiBaseUrlOverride: string | null = null;
