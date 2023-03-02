```javascript
let data = {
  users : [
    {
        uId: 1,
        nameFirst: 'Hayden',
        nameLast: 'Jacobs',
        email: 'example@gmail.com',
        handleStr: 'haydenjacobs',
        password: 'password',
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
}
```

[Optional] short description: 

## Using the data
The data will be stored in this variable called data and it can only be accessed and updated through the use of the `getData()` and `setData()` functions found in `src/dataStore.js`. 

This means that in each file found in `src` that has a function which either reads data or writes data (or both), the file will need to include the following line of code

```javascript
import { getData, setData } from './dataStore.js'
```

## How the data is organised
The data has two keys being users and channels, both of which have arrays of objects as according to the `data` object in the above code. Each object in the `users` and `channels` array will have a unique `uId` and `channelId` respectively. 

It can be seen that to view messages, each object in the `channels` array has a `messages` key value corresponding to an array of objects that include the messages and some other metadata.
