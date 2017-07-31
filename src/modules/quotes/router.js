import * as user from './controller'

export const baseUrl = '/quotes'

export default [
  {
    method: 'POST',
    route: '/',
    handlers: [
      user.createQuote
    ],
    permissions: 'authenticated'
  },
  {
    method: 'GET',
    route: '/',
    handlers: [
      user.getQuotes
    ],
    permissions: '*'
  }
  // {
  //   method: 'GET',
  //   route: '/:id',
  //   handlers: [
  //     user.getUser
  //   ],
  //   permissions: ['admin', 'manager']
  // },
  // {
  //   method: 'PUT',
  //   route: '/:id',
  //   handlers: [
  //     user.getUser,
  //     user.updateUser
  //   ],
  //   permissions: '*'
  // },
  // {
  //   method: 'DELETE',
  //   route: '/:id',
  //   handlers: [
  //     user.getUser,
  //     user.deleteUser
  //   ]
  // }
]
