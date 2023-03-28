import express, { json, Request, Response } from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import { clearV1 } from './other';
import { authRegisterV2, authLoginV2, authLogoutV1 } from './auth';
import { usersAllV1 } from './users';
import { userProfileV2, userProfileSetNameV1 } from './user';
import { dmCreateV1, dmDetailsV1 } from './dm';

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

app.post('/auth/register/v2', (req: Request, res: Response, next) => {
  const { email, password, nameFirst, nameLast } = req.body;
  return res.json(authRegisterV2(email, password, nameFirst, nameLast));
});

app.post('/auth/login/v2', (req: Request, res: Response, next) => {
  const { email, password } = req.body;
  return res.json(authLoginV2(email, password));
});

app.post('/auth/logout/v1', (req: Request, res: Response, next) => {
  const { token } = req.body;
  return res.json(authLogoutV1(token));
});

app.get('/user/profile/v2', (req: Request, res: Response, next) => {
  const userToken = req.query.token as string;
  const id = req.query.uId as string;
  return res.json(userProfileV2(userToken, id));
});

app.get('/users/all/v1', (req: Request, res: Response, next) => {
  const userToken = req.query.token as string;
  return res.json(usersAllV1(userToken));
});

app.put('/user/profile/setname/v1', (req: Request, res: Response, next) => {
  const { token, nameFirst, nameLast } = req.body;
  return res.json(userProfileSetNameV1(token, nameFirst, nameLast));
});

app.post('/dm/create/v1', (req: Request, res: Response, next) => {
  const { token, uIds } = req.body;
  return res.json(dmCreateV1(token, uIds));
});

app.get('/dm/details/v1', (req: Request, res: Response, next) => {
  const token = req.query.token as string;
  const dmId = parseInt(req.query.dmId as string);
  return res.json(dmDetailsV1(token, dmId));
});

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});
