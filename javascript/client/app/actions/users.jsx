
export const ACTIVE_USER_CHANGED = 'ACTIVE_USER_CHANGED'

export function activeUserChanged(user) {
  return {
    type: ACTIVE_USER_CHANGED,
    user: user
  }
}
