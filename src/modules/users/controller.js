const _ = require('lodash');
import Boom from 'boom';
import * as RateHandler from '../../utils/rateHandler';

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

export async function createSerieRate (ctx) {
  const Rate = ctx.app.models.rate;
  const Serie = ctx.app.models.serie;
  const serieId = ctx.params.serieId;
  const rate = ctx.request.body;
  const userId = ctx.state.user.id;
  rate.userId = ctx.state.user.id;
  rate.serieId = serieId;

  if (!rate.rate) throw Boom.badRequest();
  const validRates = ['bad', 'meh', 'good', 'great', 'perfect'];
  if (validRates.indexOf(rate.rate) === -1) throw Boom.badRequest('Invalid rate');
  const rateFilter = {
    where: {
      serieId: { inq: [serieId] },
      userId: { inq: [userId] }
    }
  };

  const { data: currentRate, err } = await to(Rate.findOne(rateFilter));
  if (err) throw Boom.wrap(err);
  if (currentRate) {
    await RateHandler.updateSerieRate(Serie, rate, currentRate)

    const updateStatement = { rate: rate.rate };
    const { err: errDeleteRate } = await to(Rate.updateById(currentRate.id, updateStatement));
    if (errDeleteRate) throw Boom.wrap(errDeleteRate);
    ctx.body = currentRate;
    return;
  }

  await RateHandler.increseSerieRate(Serie, rate);

  const { data: newRate, err: errRate } = await to(Rate.create(rate));
  if (err) throw Boom.wrap(err);

  ctx.body = newRate;
}

export async function deleteSerieRate (ctx) {
  const Rate = ctx.app.models.rate;
  const Serie = ctx.app.models.serie;
  const serieId = ctx.params.serieId;
  const userId = ctx.state.user.id;

  const rateFilter = {
    where: {
      serieId: { inq: [serieId] },
      userId: { inq: [userId] }
    }
  };

  const { data: currentRate, err } = await to(Rate.findOne(rateFilter));
  if (err) throw Boom.wrap(err);
  if (currentRate) {
    await RateHandler.decreseSerieRate(Serie, currentRate);
  }

  const destroyWhere = {
    serieId: { inq: [serieId] },
    userId: { inq: [userId] }
  };

  const { data: count, errDestroy } = await to(Rate.destroyAll(destroyWhere));
  if (errDestroy) throw Boom.wrap(errDestroy);

  ctx.body = count;
}
