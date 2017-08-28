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

export async function createReaction (ctx) {
  const Reaction = ctx.app.models.reaction;
  const reaction = ctx.request.body;
  reaction.userId = ctx.state.user.id;

  const { data: userReactions, err } = await to(Reaction.find({ where: { userId: reaction.userId } }));
  if (err) throw Boom.wrap(err);
  if (userReactions.length) throw Boom.badRequest();

  const { data: newReaction, err: errReaction } = await to(Reaction.create(reaction));
  if (errReaction) throw Boom.wrap(err);

  newReaction.user = {
    id: ctx.state.user.id,
    name: ctx.state.user.username
  };

  ctx.body = newReaction;
}

export async function updateReaction (ctx) {
  const Reaction = ctx.app.models.reaction;
  const reaction = ctx.request.body;
  const reactionId = ctx.params.reactionId;
  const userId = ctx.state.user.id;
  
  const { data: userReaction, err } = await to(Reaction.findById(reactionId));
  if (err) throw Boom.wrap(err);
  if (!userReaction) throw Boom.notFound();
  
  if (userReaction && (userReaction.userId !== userId)) throw Boom.badRequest('Reaction no pertenece a usuario');

  userReaction.reaction = reaction.reaction;

  const { data: updatedReaction, err: errUpdate } = await to(Reaction.updateById(reactionId, userReaction));
  if (errUpdate) throw Boom.wrap(errUpdate);
  
  updatedReaction.user = {
    id: ctx.state.user.id,
    name: ctx.state.user.username
  };

  ctx.body = updatedReaction;
}

export async function getReactions (ctx) {
  const Reaction = ctx.app.models.reaction;
  const User = ctx.app.models.user;
  const filter = ctx.query.filter;

  const { data: reactions, err } = await to(Reaction.find(filter));
  if (err) throw Boom.wrap(err);

  const usersIds = reactions.map(reaction => reaction.userId);
  const usersFilter = {
    fields: ['name'],
    where: {
      id: { inq: usersIds }
    }
  };
  const { data: users, err: errUser } = await to(User.find(usersFilter));
  if (errUser) throw Boom.wrap(err);

  reactions.forEach(reaction => {
    const foundUser = _.find(users, { id: reaction.userId });
    if (foundUser) reaction.user = foundUser;
  });

  ctx.body = reactions;
}

export async function getReactionsCount (ctx) {
  const Reaction = ctx.app.models.reaction;
  const where = ctx.query.where;

  const { data: count, err } = await to(Reaction.count(where));
  if (err) throw Boom.wrap(err);
  
  ctx.body = count;
}

export async function deleteReaction (ctx) {
  const Reaction = ctx.app.models.reaction;
  const reactionId = ctx.params.reactionId;
  const userId = ctx.state.user.id;

  const { data: userReaction, err } = await to(Reaction.findById(reactionId));
  if (err) throw Boom.wrap(err);
  if (!userReaction) throw Boom.notFound();
  
  if (userReaction && (userReaction.userId !== userId)) throw Boom.badRequest('Reaction no pertenece a usuario');

  const { data: count, err: errDelete } = await to(Reaction.destroyById(reactionId));
  if (errDelete) throw Boom.wrap(errDelete);
  
  ctx.body = count;
}
