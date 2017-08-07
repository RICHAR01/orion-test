// import User from '../../models/users'
const _ = require('lodash');
import Boom from 'boom';

function to(promise,) {  
   return promise.then(data => {
      return {
        data: data
      };
   })
   .catch(err => { return {
      err: err
    };
  });
};

export async function createQuote (ctx) {
  const Quote = ctx.app.models.quote;
  const Character = ctx.app.models.character;
  const quote = ctx.request.body;
  quote.userId = ctx.state.user.id;

  const { err, data: newQuote } = await to(Quote.create(quote));
  if (err) throw Boom.wrap(err);

  const { err: errCharacter, data: character } = await to(Character.findById(newQuote.characterId));
  if (errCharacter) throw Boom.wrap(err);

  newQuote.character = character;

  ctx.body = newQuote;
}

export async function updateQuote (ctx) {
  const Quote = ctx.app.models.quote;
  const quote = ctx.request.body;
  const quoteId = ctx.params.quoteId;

  const { err, data: updatedQuote } = await to(Quote.updateById(quoteId, quote));
  if (err) throw Boom.wrap(err);
  if (!updatedQuote) throw Boom.notFound();
  
  ctx.body = updatedQuote;
}

export async function getQuotes (ctx) {
  const Quote = ctx.app.models.quote;
  const filter = ctx.query.filter;

  const { err, data: quotes } = await to(Quote.find(filter));
  if (err) throw Boom.wrap(err);

  ctx.body = quotes;
}

export async function getQuotesCount (ctx) {
  const Quote = ctx.app.models.quote;
  const where = ctx.query.where;

  const { err, data: count } = await to(Quote.count(where));
  if (err) throw Boom.wrap(err);
  
  ctx.body = count;
}

export async function getQuote (ctx) {
  const Quote = ctx.app.models.quote;
  const filter = ctx.query.filter;
  const quoteId = ctx.params.quoteId;

  const { err, data: quote } = await to(Quote.findById(quoteId, filter));
  if (err) throw Boom.wrap(err);
  if (!quote) throw Boom.notFound();

  ctx.body = quote;
}

export async function deleteQuote (ctx) {
  const Quote = ctx.app.models.quote;
  const quoteId = ctx.params.quoteId;

  const { err, data: count } = await to(Quote.destroyById(quoteId));
  if (err) throw Boom.wrap(err);
  
  ctx.body = count;
}
