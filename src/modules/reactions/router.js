import * as reaction from './controller'

export const baseUrl = '/reactions'

export default [
  {
    method: 'POST',
    route: '/',
    handlers: [
      reaction.createReaction
    ],
    permissions: 'authenticated'
  },
  {
    method: 'PUT',
    route: '/:reactionId',
    handlers: [
      reaction.updateReaction
    ],
    permissions: 'authenticated'
  },
  {
    method: 'GET',
    route: '/',
    handlers: [
      reaction.getReactions
    ],
    permissions: '*'
  },
  {
    method: 'GET',
    route: '/count',
    handlers: [
      reaction.getReactionsCount
    ],
    permissions: ['admin', 'manager']
  },
  {
    method: 'DELETE',
    route: '/:reactionId',
    handlers: [
      reaction.deleteReaction
    ],
    permissions: 'authenticated'
  }
]
