/**
 * channelMessagesV1
 * @param {*} authUserId 
 * @param {*} channelId 
 * @param {*} start 
 * @returns objectMessages
 */
function channelMessagesV1(authUserId, channelId, start) {
    return {
        messages: [
            {
              messageId: 1,
              uId: 1,
              message: 'Hello world',
              timeSent: 1582426789,
            }
          ],
          start: 0,
          end: 50,
    };
}