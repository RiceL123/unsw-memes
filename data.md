# UNSW Memes data
For UNSW Memes, the backend will be accessible with the data object. There are 5 interfaces which dictate how the `users`, `channels`, `dms`, `messages` and `data` are stored as shown below.

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
}

interface Message {
  messageId: number;
  uId: number;
  message: string;
  timeSent: number;
}

interface Channel {
  channelId: number;
  channelName: string;
  ownerMembersIds: number[];
  allMembersIds: number[];
  isPublic: boolean;
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

let data: Data = {
  users: [],
  channels: [],
  dms: [],
}
```

An example of a populated data store is shown below.

```typescript
let data = {
  users: [
    {
      uId: 1,
      nameFirst: 'Hayden',
      nameLast: 'Jacobs',
      email: 'example@gmail.com',
      password: 'password',
      handleStr: 'haydenjacobs',
      permission: 1,
      tokens: ['Xas82jalp', 'H8sl0Oop'],
    }
  ],
  channels: [
    {
      channelId: 1,
      channelName: 'COMP1531 Crunchie',
      ownerMembersIds: [1],
      allMembersIds: [1],
      isPublic: false,
      messages: [
        {
          messageId: 1,
          uId: 1,
          message: 'Hello 1531',
          timeSent: 1400,
        }
      ],
    }
  ],
  dms: [
    {
      dmId: 1,
      dmName: 'haydensjacobs, madhavmishra'
      creatorId: 1
      memberIds: [1, 2],
      messages: [
        {
          messageId: 1,
          uId: 1,
          message: 'Hello Madhav',
          timeSent: 1700,
        }
      ]
    }
  ],
}
```

[Optional] short description: 

## Using the data
The data will be stored in memory in this variable called data and it can only be accessed and updated through the use of the `getData()` and `setData()` functions found in `src/dataStore.ts`. 

This means that in each file found in `src` that has a function which either reads data or writes data (or both), the file will need to include the following line of code

```typescript
import { getData, setData } from './dataStore';
```

Additionally, to make sure data set globally is correct, the interfaces from `src/dataStore.ts` must be adhered to indicating the need for them to be imported. For example,

```typescript
import { User, Channel, Dm, Message, Data } from './dataStore';
```

Alternatively, the functions and the interfaces can be imported together with
```typescript
import { User, Channel, Dm, Message, Data, getData, setData } from './dataStore';
```

## How the data is organised
The data has 3 keys being `users`, `channels` and `dms` which have arrays of objects as according to their corresponding interface as shown above.

The `channels` and `dms` keys will both have keys called `messages` where by the corresponding `Message` interface is used.
