const _ = require('lodash');
import to from 'await-to';
import Bang from 'bang';

export async function createQuote (ctx) {
  const Quote = ctx.app.models.quote;
  const Character = ctx.app.models.character;
  const quote = ctx.request.body;
  quote.userId = ctx.state.user.id;

  const { err, data: newQuote } = await to(Quote.create(quote));
  if (err) throw Bang.wrap(err);

  const { err: errCharacter, data: character } = await to(Character.findById(newQuote.characterId));
  if (errCharacter) throw Bang.wrap(err);

  newQuote.character = character;
  newQuote.favorites = [];

  ctx.body = newQuote;
}

export async function updateQuote (ctx) {
  const Quote = ctx.app.models.quote;
  const quote = ctx.request.body;
  const quoteId = ctx.params.quoteId;

  const { data: updatedQuote, err } = await to(Quote.updateById(quoteId, quote));
  if (err) throw Bang.wrap(err);
  if (!updatedQuote) throw Bang.notFound();

  ctx.body = updatedQuote;
}

export async function getQuotes (ctx) {
  const Quote = ctx.app.models.quote;
  const User = ctx.app.models.user;
  const filter = ctx.query.filter;

  const { data: quotes, err } = await to(Quote.find(filter));
  if (err) throw Bang.wrap(err);

  // Note: If req made include of favorites relation
  if (filter && filter.include && filter.include.indexOf('favorites') !== -1) {
    let usersIds = [];
    quotes.forEach(quote => {
      const favoriteUsersIds = quote.favorites.map(favorite => favorite.userId);
      usersIds = _.union(usersIds, favoriteUsersIds);
    });

    const usersFilter = {
      fields: ['username', 'image'],
      where: { id: { inq: usersIds } }
    };
    const { data: users, err: errUser } = await to(User.find(usersFilter));
    if (errUser) throw Bang.wrap(errUser);

    quotes.forEach(quote => {
      quote.favorites.forEach(favorite => {
        const foundFavoriteUser = _.find(users, { id: favorite.userId });
        if (foundFavoriteUser) favorite.user = foundFavoriteUser;
      });
    });
  }

  ctx.body = quotes;
}

export async function getQuotesCount (ctx) {
  const Quote = ctx.app.models.quote;
  const where = ctx.query.where;

  const { err, data: count } = await to(Quote.count(where));
  if (err) throw Bang.wrap(err);

  ctx.body = count;
}

export async function getQuote (ctx) {
  const Quote = ctx.app.models.quote;
  const filter = ctx.query.filter;
  const quoteId = ctx.params.quoteId;

  const { err, data: quote } = await to(Quote.findById(quoteId, filter));
  if (err) throw Bang.wrap(err);
  if (!quote) throw Bang.notFound();

  ctx.body = quote;
}

export async function deleteQuote (ctx) {
  const Quote = ctx.app.models.quote;
  const quoteId = ctx.params.quoteId;

  const { err, data: count } = await to(Quote.destroyById(quoteId));
  if (err) throw Bang.wrap(err);

  ctx.body = count;
}
