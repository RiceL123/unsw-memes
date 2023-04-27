import express, { json, Request, Response } from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import errorHandler from 'middleware-http-errors';

import { clearV1 } from './other';
import { authRegisterV2, authLoginV2, authLogoutV1, authPasswordResetRequestV1, authPasswordResetResetV1 } from './auth';
import { dmCreateV2, dmDetailsV2, dmLeaveV2, dmRemoveV2, dmListV2, dmMessagesV2 } from './dm';
import { usersAllV2 } from './users';
import { userProfileV3, userProfileSetNameV2, userProfileSetEmailV2, userProfileSetHandleV2, userProfileUploadPhotoV1 } from './user';
import { channelDetailsV3, channelInviteV3, channelJoinV3, channelMessagesV3, channelLeaveV2, channelAddOwnerV2, channelRemoveOwnerV2 } from './channel';
import { channelsCreateV3, channelsListV3, channelsListAllV3 } from './channels';
import { standupActiveV1, standupSendV1, standupStartV1 } from './standup';
import { messageSendV3, messageEditV3, messageRemoveV3, messageSendDmV2, messagePinV1, messageUnpinV1, messageShareV1, messageReactV1, messageUnreactV1, messageSendLaterV1, messageSendLaterDmV1 } from './message';
import { adminUserRemoveV1, adminUserPermissionChangeV1 } from './admin';
import { notificationsGetV1 } from './notifications';
import { searchV1 } from './search';

import { userStats, usersStats } from './stats';

// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());
app.use('/profileImages', express.static('profileImages'));
// for logging errors (print to terminal)
app.use(morgan('dev'));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

// Example get request
app.get('/echo', (req: Request, res: Response, next) => {
  const data = req.query.echo as string;
  return res.json(echo(data));
});

app.delete('/clear/v1', (req: Request, res: Response, next) => {
  return res.json(clearV1());
});

app.get('/search/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const queryStr = req.query.queryStr as string;
  return res.json(searchV1(token, queryStr));
});

/// ////////////////////////////////////////////////////////////
/// //////////////////  channels routes    /////////////////////
/// ////////////////////////////////////////////////////////////
app.post('/channels/create/v3', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const { name, isPublic } = req.body;
  return res.json(channelsCreateV3(token, name, isPublic));
});

app.get('/channels/listAll/v3', (req: Request, res: Response, next) => {
  const token = req.header('token');
  res.json(channelsListAllV3(token));
});

app.get('/channels/list/v3', (req: Request, res: Response, next) => {
  const token = req.header('token');
  return res.json(channelsListV3(token));
});

/// ////////////////////////////////////////////////////////////
/// //////////////////    auth routes      /////////////////////
/// ////////////////////////////////////////////////////////////
app.post('/auth/login/v3', (req: Request, res: Response, next) => {
  const { email, password } = req.body;
  return res.json(authLoginV2(email, password));
});

app.post('/auth/register/v3', (req: Request, res: Response, next) => {
  const { email, password, nameFirst, nameLast } = req.body;
  return res.json(authRegisterV2(email, password, nameFirst, nameLast));
});

app.post('/auth/logout/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  return res.json(authLogoutV1(token));
});

app.post('/auth/passwordreset/request/v1', (req: Request, res: Response, next) => {
  const { email } = req.body;
  return res.json(authPasswordResetRequestV1(email));
});

app.post('/auth/passwordreset/reset/v1', (req: Request, res: Response, next) => {
  const { resetCode, newPassword } = req.body;
  return res.json(authPasswordResetResetV1(resetCode, newPassword));
});

/// ////////////////////////////////////////////////////////////
/// //////////////////   channel routes    /////////////////////
/// ////////////////////////////////////////////////////////////
app.get('/channel/details/v3', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const channelId = parseInt(req.query.channelId as string);
  return res.json(channelDetailsV3(token, channelId));
});

app.post('/channel/join/v3', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const { channelId } = req.body;
  return res.json(channelJoinV3(token, channelId));
});

app.post('/channel/invite/v3', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const { channelId, uId } = req.body;
  return res.json(channelInviteV3(token, channelId, uId));
});

app.get('/channel/messages/v3', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const channelId = parseInt(req.query.channelId as string);
  const start = parseInt(req.query.start as string);
  return res.json(channelMessagesV3(token, channelId, start));
});

app.post('/channel/leave/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const { channelId } = req.body;
  return res.json(channelLeaveV2(token, channelId));
});

app.post('/channel/addowner/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const { channelId, uId } = req.body;
  return res.json(channelAddOwnerV2(token, channelId, uId));
});

app.post('/channel/removeowner/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const { channelId, uId } = req.body;
  return res.json(channelRemoveOwnerV2(token, channelId, uId));
});

/// ////////////////////////////////////////////////////////////
/// //////////////////    users routes      ////////////////////
/// ////////////////////////////////////////////////////////////
app.get('/users/all/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  return res.json(usersAllV2(token));
});

/// ////////////////////////////////////////////////////////////
/// //////////////////    user routes      /////////////////////
/// ////////////////////////////////////////////////////////////
app.get('/user/profile/v3', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const id = parseInt(req.query.uId as string);
  return res.json(userProfileV3(token, id));
});

app.put('/user/profile/setname/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const { nameFirst, nameLast } = req.body;
  return res.json(userProfileSetNameV2(token, nameFirst, nameLast));
});

app.put('/user/profile/setemail/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const { email } = req.body;
  return res.json(userProfileSetEmailV2(token, email));
});

app.put('/user/profile/sethandle/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const { handleStr } = req.body;
  return res.json(userProfileSetHandleV2(token, handleStr));
});

app.post('/user/profile/uploadphoto/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const { imgUrl, xStart, yStart, xEnd, yEnd } = req.body;
  return res.json(userProfileUploadPhotoV1(token, imgUrl, xStart, yStart, xEnd, yEnd));
});

/// ////////////////////////////////////////////////////////////
/// //////////////////       dm routes      ////////////////////
/// ////////////////////////////////////////////////////////////
app.post('/dm/create/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const { uIds } = req.body;
  return res.json(dmCreateV2(token, uIds));
});

app.get('/dm/list/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  return res.json(dmListV2(token));
});

app.delete('/dm/remove/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const dmId = parseInt(req.query.dmId as string);

  return res.json(dmRemoveV2(token, dmId));
});

app.get('/dm/details/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const dmId = parseInt(req.query.dmId as string);
  return res.json(dmDetailsV2(token, dmId));
});

app.post('/dm/leave/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const { dmId } = req.body;
  return res.json(dmLeaveV2(token, dmId));
});

app.get('/dm/messages/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const dmId = parseInt(req.query.dmId as string);
  const start = parseInt(req.query.start as string);
  return res.json(dmMessagesV2(token, dmId, start));
});

/// ////////////////////////////////////////////////////////////
/// //////////////////   message routes     ////////////////////
/// ////////////////////////////////////////////////////////////
app.post('/message/send/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const { channelId, message } = req.body;
  return res.json(messageSendV3(token, channelId, message));
});

app.put('/message/edit/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const { messageId, message } = req.body;
  return res.json(messageEditV3(token, messageId, message));
});

app.delete('/message/remove/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const messageId = parseInt(req.query.messageId as string);
  return res.json(messageRemoveV3(token, messageId));
});

app.post('/message/senddm/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const { dmId, message } = req.body;
  return res.json(messageSendDmV2(token, dmId, message));
});

app.post('/message/pin/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const { messageId } = req.body;
  return res.json(messagePinV1(token, messageId));
});

app.post('/message/unpin/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const { messageId } = req.body;
  return res.json(messageUnpinV1(token, messageId));
});

app.post('/message/share/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const { ogMessageId, message, channelId, dmId } = req.body;
  return res.json(messageShareV1(token, ogMessageId, message, channelId, dmId));
});

app.post('/message/react/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const { messageId, reactId } = req.body;
  return res.json(messageReactV1(token, messageId, reactId));
});

app.post('/message/unreact/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const { messageId, reactId } = req.body;
  return res.json(messageUnreactV1(token, messageId, reactId));
});

app.post('/message/sendlater/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const { channelId, message, timeSent } = req.body;
  return res.json(messageSendLaterV1(token, channelId, message, timeSent));
});

app.post('/message/sendlaterdm/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const { dmId, message, timeSent } = req.body;
  return res.json(messageSendLaterDmV1(token, dmId, message, timeSent));
});

/// ////////////////////////////////////////////////////////////
/// //////////////////   admin routes     //////////////////////
/// ////////////////////////////////////////////////////////////
app.delete('/admin/user/remove/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const uId = parseInt(req.query.uId as string);
  return res.json(adminUserRemoveV1(token, uId));
});

app.post('/admin/userpermission/change/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const { uId, permissionId } = req.body;
  return res.json(adminUserPermissionChangeV1(token, uId, permissionId));
});

/// ////////////////////////////////////////////////////////////
/// //////////////////   standup routes     ////////////////////
/// ////////////////////////////////////////////////////////////
app.post('/standup/start/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const { channelId, length } = req.body;
  return res.json(standupStartV1(token, channelId, length));
});

app.get('/standup/active/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const channelId = parseInt(req.query.channelId as string);
  return res.json(standupActiveV1(token, channelId));
});

app.post('/standup/send/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const { channelId, message } = req.body;
  return res.json(standupSendV1(token, channelId, message));
});

/// ////////////////////////////////////////////////////////////
/// //////////////// notitifcations routes /////////////////////
/// ////////////////////////////////////////////////////////////
app.get('/notifications/get/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  return res.json(notificationsGetV1(token));
});

/// ////////////////////////////////////////////////////////////
/// ////////////////  users/stats routes   /////////////////////
/// ////////////////////////////////////////////////////////////
app.get('/user/stats/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  return res.json(userStats(token));
});

app.get('/users/stats/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  return res.json(usersStats(token));
});

// Keep this BENEATH route definitions
// handles errors nicely
app.use(errorHandler());

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});
