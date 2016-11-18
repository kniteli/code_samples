
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS'

export function receiveLogin(user) {
  return {
    type: LOGIN_SUCCESS,
    user: user
  }
}
