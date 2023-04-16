import { Data, Notification, getData, getHash, setData } from './dataStore';
import HTTPError from 'http-errors';

/** notificationsSend sends notifications to the users in userIds. It assumes the caller does
 *  checks like whether the user in the usersIds array is still apart of the channel or dm or if
 *  they reacted to their own message
 *
 * @param {Data} data - The data object containing information about the users and their notifications.
 * @param {number[]} userIds - An array of user IDs for the users who should receive the notification.
 * @param {number} dmId - The ID of the DM (Direct Message) associated with the notification.
 * @param {number} channelId - The ID of the channel associated with the notification.
 * @param {string} handleStr - The handle (username or display name) of the user who triggered the notification.
 * @param {string} channelOrDmName - The name of the channel or DM associated with the notification.
 * @param {string} message - The message to include in the notification.
 * @param {string} [key='tag'] - An optional parameter specifying the type of notification to send.
 * @returns {void}
 */
function notificationsSend(data: Data, userIds: number[], dmId: number, channelId: number, handleStr: string, channelOrDmName: string, message: string, key = 'tag') {
  const notificationMessages = {
    tag: `${handleStr} tagged you in ${channelOrDmName}: ${message.slice(0, 20)}`,
    react: `${handleStr} reacted to your message in ${channelOrDmName}`,
    add: `${handleStr} added you to ${channelOrDmName}`
  };

  userIds.forEach(x => {
    const user = data.users.find(y => y.uId === x);

    const newNotification: Notification = {
      channelId: channelId,
      dmId: dmId,
      notificationMessage: notificationMessages[key]
    };

    user.notifications.unshift(newNotification);
  });

  setData(data);
}

/** notificationsGetV1 retrieves the latest 20 notifications for a user based on their authentication token.
 *
 * @param {string} token - The authentication token for the user.
 * @returns {{ notifications: Notification[] }} - An object containing an array of up to 20 notifications for the user.
 * @throws {HTTPError} - Throws an HTTP 403 Forbidden error if the token is invalid.
*/
function notificationsGetV1(token: string) {
  const data: Data = getData();
  token = getHash(token);

  const userObj = data.users.find(x => x.tokens.includes(token));

  if (!userObj) {
    throw HTTPError(403, 'invalid token');
  }

  return { notifications: userObj.notifications.slice(0, 20) };
}

export { notificationsGetV1, notificationsSend };
