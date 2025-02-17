const _ = require('lodash');
import to from 'await-to';
import Bang from 'bang';

export async function createReaction (ctx) {
  const Reaction = ctx.app.models.reaction;
  const reaction = ctx.request.body;
  reaction.userId = ctx.state.user.id;

  const reactionsFilter = {
    where: {
      userId: reaction.userId,
      serieId: reaction.serieId
    }
  };

  const { data: userReactions, err } = await to(Reaction.find(reactionsFilter));
  if (err) throw Bang.wrap(err);
  if (userReactions.length) throw Bang.badRequest();

  const { data: newReaction, err: errReaction } = await to(Reaction.create(reaction));
  if (errReaction) throw Bang.wrap(err);

  newReaction.user = {
    id: ctx.state.user.id,
    username: ctx.state.user.username,
    image: ctx.state.user.image
  };

  ctx.body = newReaction;
}

export async function updateReaction (ctx) {
  const Reaction = ctx.app.models.reaction;
  const reaction = ctx.request.body;
  const reactionId = ctx.params.reactionId;
  const userId = ctx.state.user.id;

  const { data: userReaction, err } = await to(Reaction.findById(reactionId));
  if (err) throw Bang.wrap(err);
  if (!userReaction) throw Bang.notFound();

  if (userReaction && (userReaction.userId !== userId)) throw Bang.badRequest('Reaction no pertenece a usuario');

  userReaction.reaction = reaction.reaction;

  const { data: updatedReaction, err: errUpdate } = await to(Reaction.updateById(reactionId, userReaction));
  if (errUpdate) throw Bang.wrap(errUpdate);

  updatedReaction.user = {
    id: ctx.state.user.id,
    username: ctx.state.user.username,
    image: ctx.state.user.image
  };

  ctx.body = updatedReaction;
}

export async function getReactions (ctx) {
  const Reaction = ctx.app.models.reaction;
  const User = ctx.app.models.user;
  const filter = ctx.query.filter;

  const { data: reactions, err } = await to(Reaction.find(filter));
  if (err) throw Bang.wrap(err);

  let usersIds = reactions.map(reaction => reaction.userId);

  // Note: If req made include of favorites relation
  if (filter && filter.include && filter.include.indexOf('favorites') !== -1) {
    reactions.forEach(reaction => {
      const favoriteUsersIds = reaction.favorites.map(favorite => favorite.userId);
      usersIds = _.union(usersIds, favoriteUsersIds);
    });
  }

  const usersFilter = {
    fields: ['username', 'image'],
    where: {
      id: { inq: usersIds }
    }
  };

  const { data: users, err: errUser } = await to(User.find(usersFilter));
  if (errUser) throw Bang.wrap(err);

  reactions.forEach(reaction => {
    const foundUser = _.find(users, { id: reaction.userId });
    if (foundUser) reaction.user = foundUser;

    // Note: If req made include of favorites relation
    if (filter && filter.include && filter.include.indexOf('favorites') !== -1) {
      reaction.favorites.forEach(favorite => {
        const foundFavoriteUser = _.find(users, { id: favorite.userId });
        if (foundFavoriteUser) favorite.user = foundFavoriteUser;
      });
    }

  });

  ctx.body = reactions;
}

export async function getReactionsCount (ctx) {
  const Reaction = ctx.app.models.reaction;
  const where = ctx.query.where;

  const { data: count, err } = await to(Reaction.count(where));
  if (err) throw Bang.wrap(err);

  ctx.body = count;
}

export async function deleteReaction (ctx) {
  const Reaction = ctx.app.models.reaction;
  const reactionId = ctx.params.reactionId;
  const userId = ctx.state.user.id;

  const { data: userReaction, err } = await to(Reaction.findById(reactionId));
  if (err) throw Bang.wrap(err);
  if (!userReaction) throw Bang.notFound();

  if (userReaction && (userReaction.userId !== userId)) throw Bang.badRequest('Reaction no pertenece a usuario');

  const { data: count, err: errDelete } = await to(Reaction.destroyById(reactionId));
  if (errDelete) throw Bang.wrap(errDelete);

  ctx.body = count;
}
