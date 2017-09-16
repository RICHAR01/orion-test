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

export async function createReactionFavorite (ctx) {
  const ReactionFavorite = ctx.app.models.reactionFavorite;
  const reactionId = ctx.params.reactionId;
  const reactionFavorite = ctx.request.body;
  const userId = ctx.state.user.id;
  reactionFavorite.userId = ctx.state.user.id;
  reactionFavorite.reactionId = reactionId;

  const reactionFavoriteFilter = {
    where: {
      reactionId: { inq: [reactionId] },
      userId: { inq: [userId] }
    }
  };

  const { data: currentReactionFavorite, err } = await to(ReactionFavorite.findOne(reactionFavoriteFilter));
  if (err) throw Boom.wrap(err);
  if (currentReactionFavorite) {
    currentReactionFavorite.user = ctx.state.user;
    ctx.body = currentReactionFavorite;
    return;
  }

  const { data: newReactionFavorite, err: errReactionFavorite } = await to(ReactionFavorite.create(reactionFavorite));
  if (err) throw Boom.wrap(err);

  newReactionFavorite.user = {
    id: ctx.state.user.id,
    username: ctx.state.user.username
  };

  ctx.body = newReactionFavorite;
}

export async function deleteReactionFavorite (ctx) {
  const ReactionFavorite = ctx.app.models.reactionFavorite;
  const reactionId = ctx.params.reactionId;
  const userId = ctx.state.user.id;

  const destroyWhere = {
    reactionId: { inq: [reactionId] },
    userId: { inq: [userId] }
  };

  const { err, data: count } = await to(ReactionFavorite.destroyAll(destroyWhere));
  if (err) throw Boom.wrap(err);

  ctx.body = count;
}

export async function createQuoteFavorite (ctx) {
  const QuoteFavorite = ctx.app.models.quoteFavorite;
  const quoteId = ctx.params.quoteId;
  const quoteFavorite = ctx.request.body;
  const userId = ctx.state.user.id;
  quoteFavorite.userId = ctx.state.user.id;
  quoteFavorite.quoteId = quoteId;

  const quoteFavoriteFilter = {
    where: {
      quoteId: { inq: [quoteId] },
      userId: { inq: [userId] }
    }
  };

  const { data: currentQuoteFavorite, err } = await to(QuoteFavorite.findOne(quoteFavoriteFilter));
  if (err) throw Boom.wrap(err);
  if (currentQuoteFavorite) {
    currentQuoteFavorite.user = ctx.state.user;
    ctx.body = currentQuoteFavorite;
    return;
  }

  const { data: newQuoteFavorite, err: errQuoteFavorite } = await to(QuoteFavorite.create(quoteFavorite));
  if (err) throw Boom.wrap(err);

  newQuoteFavorite.user = {
    id: ctx.state.user.id,
    username: ctx.state.user.username
  };

  ctx.body = newQuoteFavorite;
}

export async function deleteQuoteFavorite (ctx) {
  const QuoteFavorite = ctx.app.models.quoteFavorite;
  const quoteId = ctx.params.quoteId;
  const userId = ctx.state.user.id;

  const destroyWhere = {
    quoteId: { inq: [quoteId] },
    userId: { inq: [userId] }
  };

  const { err, data: count } = await to(QuoteFavorite.destroyAll(destroyWhere));
  if (err) throw Boom.wrap(err);

  ctx.body = count;
}
