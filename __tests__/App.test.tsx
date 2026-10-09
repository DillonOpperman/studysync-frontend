import { rootFor } from '../src/navigation/rootFor';

test('signed-out users do not land on home', () => {
  expect(rootFor({ status: 'signedOut' })).not.toBe('app');
});
