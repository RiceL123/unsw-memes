# UNSW Memes data
For UNSW Memes, within the backend, data can be read and updated with the two functions `getData()` and `setData()`. The data is **persistent** as it is stored in a file called `database.json` and has constraints as according to the 7 interfaces  `Notification`, `User`, `Channel`, `Dm`, `Message`, `React` and `Data`.

The 7 interfaces are shown below.

```typescript
interface Notification {
  channelId: number;
  dmId: number;
  notificationMessage: string;
}

interface User {
  uId: number;
  nameFirst: string;
  nameLast: string;
  email: string;
  password: string;
  handleStr: string;
  permission: number;
  tokens: string[];
  resetCode: string;
  profileImgUrl: string;
}

interface React {
  reactId: number;
  uIds: number[];
  isThisUserReacted: boolean;
}

interface Message {
  messageId: number;
  uId: number;
  message: string;
  timeSent: number;
  reacts: React[],
  isPinned: boolean;
}

interface Channel {
  channelId: number;
  channelName: string;
  ownerMembersIds: number[];
  allMembersIds: number[];
  isPublic: boolean;
  standupIsActive: boolean;
  standupTimeFinish: number;
  currStandUpQueue: string[];
  messages: Message[];
}

interface Dm {
  dmId: number;
  dmName: string;
  creatorId: number;
  memberIds: number[],
  messages: Message[];
}

interface Data {
  users: User[];
  channels: Channel[];
  dms: Dm[];
}
```

The `database.json` file will initially be unpopulated as shown below.
```json
{"users":[],"channels":[],"dms":[]}
```

An example of a populated data store is shown below.

```JSON
{
  "users": [
    {
      "uId": 1,
      "nameFirst": "Madhav",
      "nameLast": "Mishra",
      "email": "z5422235@ad.unsw.edu.au",
      "password": "33df5eb0bba5780e5ecfee82895c1fa1939e56c6",
      "handleStr": "madhavmishra",
      "permission": 1,
      "tokens": [
        "ff4c531bf5e82e13de6e0a974ebbe5cb20c09e89"
      ],
      "resetCode": "",
      "profileImgUrl": "http://localhost:3200/profileImages/cropped_1.jpg",
      "notifications": [
        {
          "channelId": -1,
          "dmId": 1,
          "notificationMessage": "joebiden added you to joebiden, madhavmishra"
        },
        {
          "channelId": 0,
          "dmId": -1,
          "notificationMessage": "joebiden tagged you in Cool Channel: @madhavmishra you're"
        }
      ]
    },
    {
      "uId": 2,
      "nameFirst": "Joe",
      "nameLast": "Biden",
      "email": "email@email.com",
      "password": "33df5eb0bba5780e5ecfee82895c1fa1939e56c6",
      "handleStr": "joebiden",
      "permission": 2,
      "tokens": [
        "ba860ae6f42fc345d1d7cd6e0c77c635b8237f0c"
      ],
      "resetCode": "",
      "profileImgUrl": "http://localhost:3200/profileImages/default.jpg",
      "notifications": [
        {
          "channelId": -1,
          "dmId": 1,
          "notificationMessage": "madhavmishra reacted to your message in joebiden, madhavmishra"
        },
        {
          "channelId": -1,
          "dmId": 1,
          "notificationMessage": "joebiden tagged you in joebiden, madhavmishra: @joebiden my favouri"
        },
        {
          "channelId": 0,
          "dmId": -1,
          "notificationMessage": "madhavmishra added you to Cool Channel"
        }
      ]
    }
  ],
  "channels": [
    {
      "channelId": 0,
      "channelName": "Cool Channel",
      "ownerMembersIds": [
        1
      ],
      "allMembersIds": [
        1,
        2
      ],
      "isPublic": true,
      "standupOwner": -1,
      "standupIsActive": false,
      "standupTimeFinish": null,
      "currStandUpQueue": [],
      "messages": [
        {
          "messageId": 89291351416817,
          "uId": 1,
          "message": "look at this bozo\n@joebiden my favourite anime is 'A Silent Voice'"
          "timeSent": 1681662478,
          "reacts": [],
          "isPinned": false
        },
        {
          "messageId": 10437316691797,
          "uId": 2,
          "message": "@madhavmishra you're a dummy",
          "timeSent": 1681661991,
          "reacts": [],
          "isPinned": true
        }
      ]
    }
  ],
  "dms": [
    {
      "dmId": 1,
      "dmName": "joebiden, madhavmishra",
      "creatorId": 2,
      "memberIds": [
        1,
        2
      ],
      "messages": [
        {
          "messageId": 154319625872134,
          "uId": 2,
          "message": "@joebiden my favourite anime is 'A Silent Voice'",
          "timeSent": 1681662053,
          "reacts": [
            {
              "reactId": 1,
              "uIds": [
                1
              ],
              "isThisUserReacted": false
            }
          ],
          "isPinned": false
        }
      ]
    }
  ]
}
```

[Optional] short description: 

## Using the data
To use the `getData` and `setData` functions, an import statement is required from the `dataStore.ts` file. Additionally, when updating the data, interfaces can be used to ensure objects added are of the corresponding type. As example of how to import the functions and interfaces is shown below.
```typescript
import { Notification, React, User, Channel, Dm, Message, Data, getData, setData } from './dataStore';
```

The aforementioned two functions `getData` and `setData` are used as follows

#### getData()
The `getData()` function reads the data from the database file at `dataBasePath` (which in our case is `./src/database.json`) and returns the parsed JSON data.

#### SetData(newData: Data)

The `setData(newData: Data)` function writes the passed-in `newData` to the database file at `dataBasePath`. This function overwrites the entire data object.

## How clients will manipulate the data
Clients will manipulate the data through the various POST, PUT, GET and DELETE routes as specified in the `server.ts` file which uses the [express.js](https://expressjs.com/) framework to wrap around to the TypeScript functions which use `getData` and `setData`.

## How the data is organised
The data has 3 keys being `users`, `channels` and `dms` which have arrays of objects as according to their corresponding interface as shown above.

The `channels` and `dms` keys will both have keys called `messages` where by the corresponding `Message` interface is used.

## In the User interface, the permission can have 3 possible values
- 1 ( user is global owner)
- 2 (user is a normal member)
- 420 (user is banned)