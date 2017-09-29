import * as user from './controller'

export const baseUrl = '/users'

export default [
  {
    method: 'POST',
    route: '/reactions/:reactionId/favorite',
    handlers: [
      user.createReactionFavorite
    ],
    permissions: 'authenticated'
  },
  {
    method: 'DELETE',
    route: '/reactions/:reactionId/favorite',
    handlers: [
      user.deleteReactionFavorite
    ],
    permissions: 'authenticated'
  },
  {
    method: 'POST',
    route: '/quotes/:quoteId/favorite',
    handlers: [
      user.createQuoteFavorite
    ],
    permissions: 'authenticated'
  },
  {
    method: 'DELETE',
    route: '/quotes/:quoteId/favorite',
    handlers: [
      user.deleteQuoteFavorite
    ],
    permissions: 'authenticated'
  },
  {
    method: 'POST',
    route: '/series/:serieId/rate',
    handlers: [
      user.createSerieRate
    ],
    permissions: 'authenticated'
  },
  {
    method: 'DELETE',
    route: '/series/:serieId/rate',
    handlers: [
      user.deleteSerieRate
    ],
    permissions: 'authenticated'
  },
  {
    method: 'POST',
    route: '/auth/social',
    handlers: [
      user.loginSocial
    ],
    permissions: '*'
  },
  {
    method: 'PATCH',
    route: '/me',
    handlers: [
      user.updateUser
    ],
    permissions: 'authenticated'
  },
  {
    method: 'POST',
    route: '/requestRecoveryPassword',
    handlers: [
      user.requestRecoveryPassword
    ],
    permissions: '*'
  },
  {
    method: 'POST',
    route: '/recoveryPassword',
    handlers: [
      user.recoveryPassword
    ],
    permissions: '*'
  }
]
