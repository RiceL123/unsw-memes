import { getData } from '../dataStore';
import { clear, authRegister, authLogin, authLogout, authPasswordResetRequest, authPasswordResetReset } from './routeRequests';

// this whitebox test will test the password reset function with assumptions on
// the internal state of the dataStore to check its functionality using the
// getUserResetCode function (if a email api is used to parse the email, this function
// can be replaced - however this would also be white box as it assumes the structure
// of email body and how to parse the resetCode)

function getUserResetCode(uId: number) {
  const data = getData();
  const resetCode = data.users.find(x => x.uId === uId).resetCode;
  return resetCode;
}

test('valid password reset', () => {
  clear();
  const user = authRegister('z5422235@ad.unsw.edu.au', 'password', 'Madhav', 'Mishra');

  expect(authPasswordResetRequest('z5422235@ad.unsw.edu.au')).toStrictEqual({});

  // this line is used instead of a user checking their email to get the resetCode
  const resetCode = getUserResetCode(user.authUserId);

  // fails because the password is < 6 character - however, resetCode still valid
  expect(authPasswordResetReset(resetCode, '12345')).toStrictEqual(400);

  // successful reset
  expect(authPasswordResetReset(resetCode, 'newPassword'));

  // this means that though madhav was was logged in after registering, he is automatically logged out after successful reset
  // so madhav should not be able to logout again
  expect(authLogout(user.token)).toStrictEqual(403);

  // this also means if madhav tries to login with the old password it fails
  expect(authLogin('z5422235@ad.unsw.edu.au', 'password')).toStrictEqual(400);

  // however, the new password should work
  expect(authLogin('z5422235@ad.unsw.edu.au', 'newPassword')).toStrictEqual({ token: expect.any(String), authUserId: expect.any(Number) });

  // additionally, the previous reset code should not work since it has been used already
  expect(authPasswordResetReset(resetCode, 'newnewPassword')).toStrictEqual(400);
});
