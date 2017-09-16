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
]