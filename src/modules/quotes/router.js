import * as quote from './controller'

export const baseUrl = '/quotes'

export default [
  {
    method: 'POST',
    route: '/',
    handlers: [
      quote.createQuote
    ],
    permissions: 'authenticated'
  },
  {
    method: 'PUT',
    route: '/:quoteId',
    handlers: [
      quote.updateQuote
    ],
    permissions: ['admin', 'manager']
  },
  {
    method: 'GET',
    route: '/',
    handlers: [
      quote.getQuotes
    ],
    permissions: '*'
  },
  {
    method: 'GET',
    route: '/count',
    handlers: [
      quote.getQuotesCount
    ],
    permissions: ['admin', 'manager']
  },
  {
    method: 'GET',
    route: '/:quoteId',
    handlers: [
      quote.getQuote
    ],
    permissions: '*'
  },
  {
    method: 'DELETE',
    route: '/:quoteId',
    handlers: [
      quote.deleteQuote
    ],
    permissions: ['admin', 'manager']
  }
]
