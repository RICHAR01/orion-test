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

export async function getTopInteractions (ctx) {
  const Reaction = ctx.app.models.reaction;
  const User = ctx.app.models.user;
  const Quote = ctx.app.models.quote;
  const serieId = ctx.params.serieId;

  const reactionsFilter = {
    limit: 6,
    where: {
      serieId: serieId
    }
  };

  const quotesFilter = {
    limit: 6,
    where: {
      serieId: serieId
    },
    include: 'character'
  };

  const { data: reactions, err } = await to(Reaction.find(reactionsFilter));
  if (err) throw Boom.wrap(err);

  const usersIds = reactions.map(reaction => reaction.userId);
  const usersFilter = {
    fields: ['username'],
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

  const { data: quotes, err: quotesError } = await to(Quote.find(quotesFilter));
  if (quotesError) throw Boom.wrap(err);

  const topInteractions = {
    reactions: reactions,
    quotes: quotes
  }
  
  ctx.body = topInteractions;
}
