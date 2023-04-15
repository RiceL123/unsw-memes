
# UNSW Memes data
For UNSW Memes, within the backend, data can be read and updated with the two functions `getData()` and `setData()`. The data is **persistent** as it is stored in a file called `database.json` and has constraints as according to the 5 interfaces  `User`, `Channel`, `Dm`, `Message` and `Data`.

The 6 interfaces are shown below.

```typescript
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
      "email": "z5555555@ad.unsw.edu.au",
      "password": "password1",
      "handleStr": "madhavmishra",
      "permission": 1,
      "tokens": [ 
        "d5c5e1ca-e2e0-482e-b53f-e68b56c3bf51"
      ],
      "profileImgUrl": "http://localhost:3200/profileImages/default.jpg",
    },
    {
      "uId": 2,
      "nameFirst": "John",
      "nameLast": "Smith",
      "email": "john@gmail.com",
      "password": "securepassword,1",
      "handleStr": "johnsmith",
      "permission": 2,
      "tokens": [
        "a18ab61a-3e70-494c-b146-00a877e58816",
        "2d30fc17-fa21-47ac-9fb6-9abb25b571bd"
      ],
      "profileImgUrl": "http://localhost:3200/profileImages/default.jpg",
    }
  ],
  "channels": [
    {
      "channelId": 0,
      "channelName": "study GRINDSET",
      "ownerMembersIds": [
        1
      ],
      "allMembersIds": [
        1,
        2
      ],
      "isPublic": true,
      "standupIsActive": false,
      "standupTimeFinish": 1680372750,
      "currStandUpQueue": [
        "jake: 'I ate a catfish",
        "giuliana: 'I went to kmart",
      ],
      "messages": [
        {
          "messageId": 2,
          "uId": 2,
          "message": "L bozo🤣🤣🤣",
          "timeSent": 1680172805
        },
        {
          "messageId": 1,
          "uId": 1,
          "message": "💀💀💀 I forgot to study",
          "timeSent": 1680172750
        }
      ]
    }
  ],
  "dms": [
    {
      "dmId": 1,
      "dmName": "johnsmith, madhavmishra",
      "creatorId": 2,
      "memberIds": [
        1,
        2
      ],
      "messages": [
        {
          "messageId": 3,
          "uId": 2,
          "message": "I am respectfully sliding into your dms 😉😉😉",
          "timeSent": 1680172848
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
import { User, Channel, Dm, Message, Data, getData, setData } from './dataStore';
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