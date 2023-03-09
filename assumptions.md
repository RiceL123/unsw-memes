# Assumptions
The following assumptions will be made in regards to the use of the functions and their implementation in **UNSW Memes**.

[[_TOC_]]

### 1. Negative `start` values
The `start` parameter in `channelMessagesV1()` refers to an '*integer*' and thus, can be negative. For cases where `start < 0`, an error will be returned from the function. Specifically this will be the same error that is thrown when the start is greater than the total number of messages.

```JavaScript
{ error: 'invalid start' }
```

### 2. Length of non-ascii characters in strings
The behaviour of JavaScript's built `String.prototype.length` returns the length of the string in [UTF-16 code units](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/length). This implies that characters like '💀' would be of length 2 rather than 1 as according to the human eye.

As an example the following string would be a valid password for the function `authRegisterV1()` which requires a minimum length of 6.

```JavaScript
const password = '💀💀💀';
console.log(password.length) // prints 6
```

### 3. Max number of users, channels and messages
As our implementation of generating unique Ids uses a trivial increment of `+ 1`, we will assume that the number of users will not exceed 9007199254740991 (aka `Number.MAX_SAFE_INTEGER`) because numbers greater than this value will lose precision due to the use of [IEEE 754](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) and cause the possible mismatching of channels / messages / users.

### 4. First user being a global owner
When a user is registered they become a global owner. However, if clear is called (which wipes out all the users), the next user registered will be a global owner despite not technically being "*the very first user who signs up*" as they are the first in the new data set.

### 5. Max length of strings
As this backend uses node which uses the V8 JavaScript engine, the maximum string length that can be passed into functions is [2^29 - 24](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/length#description). 

### 6. ES6 syntax and Node 14+
As our implementation uses arrow functions and `import` / `export` statements of functions, Node version 14+ is required to run the backend of **UNSW Memes**.

> (Note: we would recommend Node 18)

### 7. Time sent values of messages
Assume that the time `timeSent` value for messages is in one time zone (e.g. could be UTC). If a user is in another time zone and sends a message, the time stamp will be relative to a one time zone.

For example, someone in New York (16 hours behind Sydney) sends a message at 2am and a person in Sydney sends a message at 3am, the `timeSent` should indicate the Australian would have sent the message 15 hours earlier than the American.
