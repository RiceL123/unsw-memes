import request, { HttpVerb } from 'sync-request';
import { port, url } from '../config.json';
const SERVER_URL = `${url}:${port}`;

function requestHelper(method: HttpVerb, path: string, payload: object) {
  const res = request(method, SERVER_URL + path, payload);

  if (res.statusCode !== 200) {
    // Return error code number instead of object in case of error.
    // (just for convenience)
    return res.statusCode;
  }
  return JSON.parse(res.getBody() as string);
}

function clear() {
  return requestHelper(
    'DELETE',
    '/clear/v1',
    {}
  );
}

// ===================== channels ===================== //
function channelsCreate(token: string, name: string, isPublic: boolean) {
  return requestHelper(
    'POST',
    '/channels/create/v3',
    {
      headers: {
        token: token
      },
      json: {
        name: name,
        isPublic: isPublic,
      }
    }
  );
}

function channelsList(token: string) {
  return requestHelper(
    'GET',
    '/channels/list/v3',
    {
      headers: {
        token: token
      },
    }
  );
}

function channelsListAll(token: string) {
  return requestHelper(
    'GET',
    '/channels/listall/v3',
    {
      headers: {
        token: token,
      },
    }
  );
}

// ===================== auth ===================== //
function authRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  return requestHelper(
    'POST',
    '/auth/register/v3',
    {
      json: {
        email: email,
        password: password,
        nameFirst: nameFirst,
        nameLast: nameLast,
      }
    }
  );
}

function authLogin(email: string, password: string) {
  return requestHelper(
    'POST',
    '/auth/login/v3',
    {
      json: {
        email: email,
        password: password
      }
    }
  );
}

function authLogout(token: string) {
  return requestHelper(
    'POST',
    '/auth/logout/v2',
    {
      headers: {
        token: token
      }
    }
  );
}

function authPasswordResetRequest(email: string) {
  return requestHelper(
    'POST',
    '/auth/passwordreset/request/v1',
    {
      json: {
        email: email
      }
    }
  );
}

function authPasswordResetReset(resetCode: string, newPassword: string) {
  return requestHelper(
    'POST',
    '/auth/passwordreset/reset/v1',
    {
      json: {
        resetCode: resetCode,
        newPassword: newPassword
      }
    }
  );
}

// ===================== channel ===================== //
function channelDetails(token: string, channelId: number) {
  return requestHelper(
    'GET',
    '/channel/details/v2',
    {
      qs: {
        token: token,
        channelId: channelId
      }
    }
  );
}

function channelMessages(token: string, channelId: number, start: number) {
  return requestHelper(
    'GET',
    '/channel/messages/v3',
    {
      headers: {
        token: token,
      },
      qs: {
        channelId: channelId,
        start: start,
      }
    }
  );
}

function channelJoin(token: string, channelId: number) {
  return requestHelper(
    'POST',
    '/channel/join/v3',
    {
      headers: {
        token: token,
      },
      json: {
        channelId: channelId,
      }
    }
  );
}

function channelInvite(token: string, channelId: number, uId: number) {
  return requestHelper(
    'POST',
    '/channel/invite/v2',
    {
      json: {
        token: token,
        channelId: channelId,
        uId: uId,
      }
    }
  );
}

function channelLeave(token: string, channelId: number) {
  return requestHelper(
    'POST',
    '/channel/leave/v1',
    {
      json: {
        token: token,
        channelId: channelId
      }
    }
  );
}

function channelAddOwner(token: string, channelId: number, uId: number) {
  return requestHelper(
    'POST',
    '/channel/addowner/v1',
    {
      json: {
        token: token,
        channelId: channelId,
        uId: uId,
      }
    }
  );
}

function channelRemoveOwner(token: string, channelId: number, uId: number) {
  return requestHelper(
    'POST',
    '/channel/removeowner/v1',
    {
      json: {
        token: token,
        channelId: channelId,
        uId: uId,
      }
    }
  );
}

// ===================== users ===================== //
function usersAll(token: string) {
  return requestHelper(
    'GET',
    '/users/all/v2',
    {
      headers: {
        token: token
      },
    }
  );
}

// ===================== user ===================== //
function userProfile(token: string, uId: number) {
  return requestHelper(
    'GET',
    '/user/profile/v3',
    {
      headers: {
        token: token
      },
      qs: {
        uId: uId
      }
    }
  );
}

function userProfileSetName(token: string, nameFirst: string, nameLast: string) {
  return requestHelper(
    'PUT',
    '/user/profile/setname/v2',
    {
      headers: {
        token: token
      },
      json: {
        nameFirst: nameFirst,
        nameLast: nameLast,
      },
    }
  );
}

function userProfileSetEmail(token: string, email: string) {
  return requestHelper(
    'PUT',
    '/user/profile/setemail/v2',
    {
      headers: {
        token: token
      },
      json: {
        email: email,
      },
    }
  );
}

function userProfileSetHandle(token: string, handleStr: string) {
  return requestHelper(
    'PUT',
    '/user/profile/sethandle/v2',
    {
      headers: {
        token: token
      },
      json: {
        handleStr: handleStr,
      },
    }
  );
}

// ===================== dm ===================== //
function dmCreate(token: string, uIds: number[]) {
  return requestHelper(
    'POST',
    '/dm/create/v2',
    {
      headers: {
        token: token
      },
      json: {
        uIds: uIds
      }
    }
  );
}

function dmRemove(token: string, dmId: number) {
  return requestHelper(
    'DELETE',
    '/dm/remove/v2',
    {
      headers: {
        token: token
      },
      qs: {
        dmId: dmId
      }
    }
  );
}

function dmDetails(token: string, dmId: number) {
  return requestHelper(
    'GET',
    '/dm/details/v2',
    {
      headers: {
        token: token
      },
      qs: {
        dmId: dmId
      }
    }
  );
}

function dmLeave(token: string, dmId: number) {
  return requestHelper(
    'POST',
    '/dm/leave/v2',
    {
      headers: {
        token: token
      },
      json: {
        dmId: dmId
      }
    }
  );
}

function dmList(token: string) {
  return requestHelper(
    'GET',
    '/dm/list/v2',
    {
      headers: {
        token: token,
      }
    }
  );
}

function dmMessages(token: string, dmId: number, start: number) {
  return requestHelper(
    'GET',
    '/dm/messages/v2',
    {
      headers: {
        token: token
      },
      qs: {
        dmId: dmId,
        start: start,
      }
    }
  );
}

// ===================== message ===================== //
function messageSend(token: string, channelId: number, message: string) {
  return requestHelper(
    'POST',
    '/message/send/v1',
    {
      json: {
        token: token,
        channelId: channelId,
        message: message,
      }
    }
  );
}

function messageEdit(token: string, messageId: number, message: string) {
  return requestHelper(
    'PUT',
    '/message/edit/v1',
    {
      json: {
        token: token,
        messageId: messageId,
        message: message,
      },
    }
  );
}

function messageRemove(token: string, messageId: number) {
  return requestHelper(
    'DELETE',
    '/message/remove/v1',
    {
      qs: {
        token: token,
        messageId: messageId,
      },
    }
  );
}

function messageSendDm(token: string, dmId: number, message: string) {
  return requestHelper(
    'POST',
    '/message/senddm/v1',
    {
      json: {
        token: token,
        dmId: dmId,
        message: message
      },
    }
  );
}
export {
  clear,
  channelsCreate,
  channelsListAll,
  channelsList,
  authLogin,
  authRegister,
  authLogout,
  authPasswordResetRequest,
  authPasswordResetReset,
  channelDetails,
  channelJoin,
  channelInvite,
  channelMessages,
  channelLeave,
  channelAddOwner,
  channelRemoveOwner,
  usersAll,
  userProfile,
  userProfileSetName,
  userProfileSetEmail,
  userProfileSetHandle,
  dmCreate,
  dmList,
  dmRemove,
  dmDetails,
  dmLeave,
  dmMessages,
  messageSend,
  messageEdit,
  messageRemove,
  messageSendDm
};
