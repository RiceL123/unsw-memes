import { getUserWithToken } from '../database/dbUsers';
import { getUserNotifications } from '../database/dbNotifications';
import { getHash } from './dataStore';
import HTTPError from 'http-errors';

/** notificationsGetV1 retrieves the latest 20 notifications for a user based on their authentication token.
 *
 * @param {string} token - The authentication token for the user.
 * @returns {{ notifications: Notification[] }} - An object containing an array of up to 20 notifications for the user.
 * @throws {HTTPError} - Throws an HTTP 403 Forbidden error if the token is invalid.
*/
function notificationsGetV1(token: string) {
  token = getHash(token);

  const user = getUserWithToken(token);

  if (!user) {
    throw HTTPError(403, 'invalid token');
  }

  const notifications = getUserNotifications(user.id).slice(0, 20);

  return { notifications: notifications.slice(0, 20) };
}

export { notificationsGetV1 };
