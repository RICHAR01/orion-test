import _ from 'lodash';
import to from 'await-to';
import Bang from 'bang';

export async function getTopInteractions (ctx) {
  const Reaction = ctx.app.models.reaction;
  const User = ctx.app.models.user;
  const Quote = ctx.app.models.quote;
  const serieId = ctx.params.serieId;

  const reactionsFilter = {
    limit: 5,
    where: {
      serieId: serieId
    },
    include: 'favorites'
  };

  const quotesFilter = {
    limit: 5,
    where: {
      serieId: serieId
    },
    include: ['character', 'favorites']
  };

  const { data: reactions, err } = await to(Reaction.find(reactionsFilter));
  if (err) throw Bang.wrap(err);

  const { data: quotes, err: quotesError } = await to(Quote.find(quotesFilter));
  if (quotesError) throw Bang.wrap(err);

  // Note: Get users ids
  let usersIds = reactions.map(reaction => reaction.userId);
  reactions.forEach(reaction => {
    const favoriteUsersIds = reaction.favorites.map(favorite => favorite.userId);
    usersIds = _.union(usersIds, favoriteUsersIds);
  });
  quotes.forEach(quote => {
    const favoriteUsersIds = quote.favorites.map(favorite => favorite.userId);
    usersIds = _.union(usersIds, favoriteUsersIds);
  });

  const usersFilter = {
    fields: ['username', 'image'],
    where: {
      id: { inq: usersIds }
    }
  };
  const { data: users, err: errUser } = await to(User.find(usersFilter));
  if (errUser) throw Bang.wrap(err);

  // Note: Asign users
  reactions.forEach(reaction => {
    const foundUser = _.find(users, { id: reaction.userId });
    if (foundUser) reaction.user = foundUser;

    reaction.favorites.forEach(favorite => {
      const foundFavoriteUser = _.find(users, { id: favorite.userId });
      if (foundFavoriteUser) favorite.user = foundFavoriteUser;
    });
  });

  quotes.forEach(quote => {
    quote.favorites.forEach(favorite => {
      const foundFavoriteUser = _.find(users, { id: favorite.userId });
      if (foundFavoriteUser) favorite.user = foundFavoriteUser;
    });
  });

  const topInteractions = {
    reactions: reactions,
    quotes: quotes
  }

  ctx.body = topInteractions;
}
