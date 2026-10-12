import type { NotificationDto } from '../../api/types';
import { notificationDestination } from '../notifications/destination';
import type { AppStackParamList } from '../../navigation/types';
import type { NavigationContainerRef } from '@react-navigation/native';

export function openOnAppStack(
  nav: NavigationContainerRef<AppStackParamList>,
  note: Pick<NotificationDto, 'type' | 'data'> | null,
): void {
  if (!nav.isReady()) {
    return;
  }
  if (!note) {
    nav.navigate('Home', { screen: 'Notifications' });
    return;
  }
  const dest = notificationDestination(note);
  switch (dest.kind) {
    case 'friends':
      nav.navigate('Home', { screen: 'Friends' });
      return;
    case 'groupDetail':
      nav.navigate('Home', {
        screen: 'GroupDetail',
        params: { groupId: dest.groupId },
      });
      return;
    case 'directChat':
      nav.navigate('DirectChat', { userId: dest.userId, name: 'Message' });
      return;
    default:
      nav.navigate('Home', { screen: 'Notifications' });
  }
}
