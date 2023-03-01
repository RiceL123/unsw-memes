import { getData, setData } from './dataStore.js';

// Stub function for authLoginV1
// Returns authUserId

function authLoginV1(email, password) {
    return {
        authUserId: 1,
    };
}

// Stub function for authRegisterV1
// Returns authUserId

function authRegisterV1(email, password, nameFirst, nameLast) {
    let data = getData();

    let uId = 1;
    if (data.users.length > 0) {
        uId = Math.max.apply(null, data.users.map(x => x.uId)) + 1;
    }

    // if the newly generated uId already exists, then return error
    if (data.users.some(x => x.uId === uId)) {
        return { error: 'could not generate new authUserId' };
    }

    const newUser = {
        uId: uId,
        nameFirst: nameFirst,
        nameLast: nameLast,
        email: email,
        password: password
    };

    data.users.push(newUser);

    setData(data);

    return {
        authUserId: uId
    };
}

export { authLoginV1, authRegisterV1 };