# Assumptions
The following assumptions will be made in regards to the use of the functions / routes and their implementation in **UNSW Memes**.

[[_TOC_]]

### 1. Negative `start` values
The `start` parameter in the `channelMessagesV1()` function / `/channel/messages/v2` route refers to an '*integer*' and thus, can be negative. For cases where `start < 0`, an error will be returned from the function. Specifically this will be the same error that is thrown when the start is greater than the total number of messages.

```JavaScript
{ error: 'invalid start' }
```

### 2. JavaScript / NodeJS string behaviour
The behaviour of JavaScript's built `String.prototype.length` returns the length of the string in [UTF-16 code units](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/length). This implies that characters like '💀' would be of length 2 rather than 1 as according to the human eye.

As an example the following string would be a valid password for the `authRegisterV1()` function / `/auth/register/v2` route which requires a minimum length of 6.

```JavaScript
const password = '💀💀💀';
console.log(password.length) // prints 6
```

Additionally, as this backend uses node which uses the V8 JavaScript engine, the **maximum** string length that can be passed into functions is [2^29 - 24](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/length#description). 

> (Note: we would recommend using Node 14+ with our packages, ES6 syntax and `import` / `export` statements)

### 3. /dm/create/v1 `uIds` array contains caller's uId
The condition explains that if there are any duplicates within the `uIds` array passed in the `/dm/create/v1` route, an error should be thrown. This also means that if the user who calls the `/dm/create/v1` route (the one the inputs their token) has their own corresponding uId within the `uIds` array, an error will also be thrown.

### 4. First user being a global owner
When a user is registered they become a global owner. However, if clear is called (which wipes out all the users), the next user registered will be a global owner despite not technically being "*the very first user who signs up*" as they are the first in the new data set.

### 5. Leaving a Channel / Dm
If the user is the only member of a channel or dm and calls `/channel/leave/v1` or `/dm/leave/v1`, the channel / dm will not be removed from the database. In order to remove an entire channel or dm, the routes `/channel/remove/v1` or `/dm/remove/v1` should be called.

When a channel owner is leaves a channel, they also remove their the channel owner permissions and as such, if they were to join again, would not have their previous owner status. On the other hand, if dm creator leaves and joins again, they keep their dm creator status. 

If a user is the original sender of the message, they have the ability to edit / remove it with the `/message/edit/v1` or `/message/remove/v1` routes. However, if the user send the message in a channel or dm that they have left (despite being the original sender), they cannot edit or remove that message unless they join the corresponding message / dm they left.

### 6. Time sent values of messages
Assume that the time `timeSent` value for messages is in one time zone (e.g. could be UTC). If a user is in another time zone and sends a message, the time stamp will be relative to a one time zone.

For example, someone in New York (16 hours behind Sydney) sends a message at 2am and a person in Sydney sends a message at 3am, the `timeSent` should indicate the Australian would have sent the message 15 hours earlier than the American.