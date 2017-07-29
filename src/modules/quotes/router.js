import { ensureUser } from '../../middleware/validators'
import * as user from './controller'

export const baseUrl = '/quotes'

export default [
  {
    method: 'POST',
    route: '/',
    handlers: [
      user.createUser
    ],
    permissions: '*' // ['admin', 'manager']
  },
  {
    method: 'GET',
    route: '/',
    handlers: [
      user.getQuotes
    ],
    permissions: '*'
  },
  {
    method: 'GET',
    route: '/:id',
    handlers: [
      ensureUser,
      user.getUser
    ],
    permissions: ['admin', 'manager']
  },
  {
    method: 'PUT',
    route: '/:id',
    handlers: [
      ensureUser,
      user.getUser,
      user.updateUser
    ],
    permissions: '*'
  },
  {
    method: 'DELETE',
    route: '/:id',
    handlers: [
      ensureUser,
      user.getUser,
      user.deleteUser
    ]
  }
]
