import * as reaction from './controller'

export const baseUrl = '/series'

export default [
  {
    method: 'GET',
    route: '/:serieId/topInteractions',
    handlers: [
      reaction.getTopInteractions
    ],
    permissions: '*'
  }
]
