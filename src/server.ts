import express, { json, Request, Response } from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import errorHandler from 'middleware-http-errors';

import { clearV1 } from './other';
import { authRegisterV2, authLoginV2, authLogoutV1, authPasswordResetRequestV1, authPasswordResetResetV1 } from './auth';
import { dmCreateV1, dmDetailsV1, dmLeaveV1, dmRemoveV1, dmListV1, dmMessagesV1 } from './dm';
import { usersAllV2 } from './users';
import { userProfileV3, userProfileSetNameV2, userProfileSetEmailV2, userProfileSetHandleV2 } from './user';

import { channelDetailsV2, channelInviteV2, channelJoinV3, channelMessagesV2, channelLeaveV1, channelAddOwnerV1, channelRemoveOwnerV1 } from './channel';
import { channelsCreateV3, channelsListV3, channelsListAllV3 } from './channels';
import { messageSendV1, messageEditV1, messageRemoveV1, messageSendDmV1 } from './message';

// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());
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

/// ////////////////////////////////////////////////////////////
/// //////////////////  channels routes    /////////////////////
/// ////////////////////////////////////////////////////////////
app.post('/channels/create/v3', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const { name, isPublic } = req.body;
  return res.json(channelsCreateV3(token, name, isPublic));
});

app.get('/channels/listall/v3', (req: Request, res: Response, next) => {
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
app.get('/channel/details/v2', (req: Request, res: Response, next) => {
  const token = req.query.token as string;
  const channelId = req.query.channelId as string;
  return res.json(channelDetailsV2(token, channelId));
});

app.post('/channel/join/v3', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const { channelId } = req.body;
  return res.json(channelJoinV3(token, channelId));
});

app.post('/channel/invite/v2', (req: Request, res: Response, next) => {
  const { token, channelId, uId } = req.body;
  return res.json(channelInviteV2(token, channelId, uId));
});

app.get('/channel/messages/v3', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const channelId = req.query.channelId as string;
  const start = req.query.start as string;
  return res.json(channelMessagesV2(token, channelId, start));
});

app.post('/channel/leave/v1', (req: Request, res: Response, next) => {
  const { token, channelId } = req.body;
  return res.json(channelLeaveV1(token, channelId));
});

app.post('/channel/addowner/v1', (req: Request, res: Response, next) => {
  const { token, channelId, uId } = req.body;
  return res.json(channelAddOwnerV1(token, channelId, uId));
});

app.post('/channel/removeowner/v1', (req: Request, res: Response, next) => {
  const { token, channelId, uId } = req.body;
  return res.json(channelRemoveOwnerV1(token, channelId, uId));
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
  const id = req.query.uId as string;
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

/// ////////////////////////////////////////////////////////////
/// //////////////////       dm routes      ////////////////////
/// ////////////////////////////////////////////////////////////
app.post('/dm/create/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const { uIds } = req.body;
  return res.json(dmCreateV1(token, uIds));
});

app.get('/dm/list/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  return res.json(dmListV1(token));
});

app.delete('/dm/remove/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const dmId = parseInt(req.query.dmId as string);

  return res.json(dmRemoveV1(token, dmId));
});

app.get('/dm/details/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const dmId = parseInt(req.query.dmId as string);
  return res.json(dmDetailsV1(token, dmId));
});

app.post('/dm/leave/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const { dmId } = req.body;
  return res.json(dmLeaveV1(token, dmId));
});

app.get('/dm/messages/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const dmId = parseInt(req.query.dmId as string);
  const start = parseInt(req.query.start as string);
  return res.json(dmMessagesV1(token, dmId, start));
});

/// ////////////////////////////////////////////////////////////
/// //////////////////   message routes     ////////////////////
/// ////////////////////////////////////////////////////////////
app.post('/message/send/v1', (req: Request, res: Response, next) => {
  const { token, channelId, message } = req.body;
  return res.json(messageSendV1(token, channelId, message));
});

app.put('/message/edit/v1', (req: Request, res: Response, next) => {
  const { token, messageId, message } = req.body;
  return res.json(messageEditV1(token, messageId, message));
});

app.delete('/message/remove/v1', (req: Request, res: Response, next) => {
  const token = req.query.token as string;
  const messageId = parseInt(req.query.messageId as string);
  return res.json(messageRemoveV1(token, messageId));
});

app.post('/message/senddm/v1', (req: Request, res: Response, next) => {
  const { token, dmId, message } = req.body;
  return res.json(messageSendDmV1(token, dmId, message));
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
