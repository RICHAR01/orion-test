const _ = require('lodash');
const axios = require('axios');
const shortid = require('shortid');
import to from 'await-to';
const defaultTokenLength = 64;
const twoWeeksInSeconds = 1209600;
import moment from 'moment';
import Bang from 'bang';
import config from '../../../config'
import * as RateHandler from '../../utils/rateHandler';
import * as EmailSender from '../../utils/emailSender';
import uid from 'uid2';
import bcrypt from 'bcryptjs';
const saltWorkFactor = 10;
const maxPasswordLength = 72;

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
  if (err) throw Bang.wrap(err);
  if (currentReactionFavorite) {
    currentReactionFavorite.user = ctx.state.user;
    ctx.body = currentReactionFavorite;
    return;
  }

  const { data: newReactionFavorite, err: errReactionFavorite } = await to(ReactionFavorite.create(reactionFavorite));
  if (err) throw Bang.wrap(err);

  newReactionFavorite.user = {
    id: ctx.state.user.id,
    username: ctx.state.user.username,
    image: ctx.state.user.image
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
  if (err) throw Bang.wrap(err);

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
  if (err) throw Bang.wrap(err);
  if (currentQuoteFavorite) {
    currentQuoteFavorite.user = ctx.state.user;
    ctx.body = currentQuoteFavorite;
    return;
  }

  const { data: newQuoteFavorite, err: errQuoteFavorite } = await to(QuoteFavorite.create(quoteFavorite));
  if (err) throw Bang.wrap(err);

  newQuoteFavorite.user = {
    id: ctx.state.user.id,
    username: ctx.state.user.username,
    image: ctx.state.user.image
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
  if (err) throw Bang.wrap(err);

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

  if (!rate.rate) throw Bang.badRequest();
  const validRates = ['bad', 'meh', 'good', 'great', 'perfect'];
  if (validRates.indexOf(rate.rate) === -1) throw Bang.badRequest('Invalid rate');
  const rateFilter = {
    where: {
      serieId: { inq: [serieId] },
      userId: { inq: [userId] }
    }
  };

  const { data: currentRate, err } = await to(Rate.findOne(rateFilter));
  if (err) throw Bang.wrap(err);
  if (currentRate) {
    await RateHandler.updateSerieRate(Serie, rate, currentRate)

    const updateStatement = { rate: rate.rate };
    const { err: errDeleteRate } = await to(Rate.updateById(currentRate.id, updateStatement));
    if (errDeleteRate) throw Bang.wrap(errDeleteRate);
    ctx.body = currentRate;
    return;
  }

  await RateHandler.increseSerieRate(Serie, rate);

  const { data: newRate, err: errRate } = await to(Rate.create(rate));
  if (err) throw Bang.wrap(err);

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
  if (err) throw Bang.wrap(err);
  if (currentRate) {
    await RateHandler.decreseSerieRate(Serie, currentRate);
  }

  const destroyWhere = {
    serieId: { inq: [serieId] },
    userId: { inq: [userId] }
  };

  const { data: count, errDestroy } = await to(Rate.destroyAll(destroyWhere));
  if (errDestroy) throw Bang.wrap(errDestroy);

  ctx.body = count;
}

export async function loginSocial (ctx) {
  const User = ctx.app.models.user;
  const RoleMapping = ctx.app.models.roleMapping;
  const AccessToken = ctx.app.models.AccessToken;
  const credentials = ctx.request.body;
  const provider = credentials.provider;
  const socialToken = credentials.token;

  if (!provider || !socialToken) {
    throw Bangb.badRequest();
  }

  // Note: Obtain user data
  let apiResponse;
  if (provider === 'google') {
    const googleApiUrl = 'https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=' + socialToken;

    const { data: response, err: errAxios } = await to(axios.get(googleApiUrl));
    if (errAxios) throw Bang.wrap(errAxios);
    apiResponse = response;
  } else if (provider === 'facebook') {
    const facebookApiUrl = 'https://graph.facebook.com/v2.10/me?access_token=' + socialToken + '&debug=all&fields=id%2Cname%2Cemail&format=json&method=get&pretty=0&suppress_http_code=1';

    const { data: response, err: errAxios } = await to(axios.get(facebookApiUrl));
    if (errAxios) throw Bang.wrap(errAxios);
    apiResponse = response;
  }

  const email = apiResponse.data.email;
  const username = _.head(email.split('@'));

  const usersFilter = {
    where: {
      or: [
        { username: { inq: [ username ] } },
        { email: { inq: [ email ] } }
      ]
    }
  };

  let { data: currentUser, err } = await to(User.findOne(usersFilter));
  if (err) throw Bang.wrap(err);

  // Note: Create user if does not exist
  if (!currentUser) {
    const user = {
      email: email,
      username: username,
      name: username,
      roleId: 3
    };

    const { data: newUser, err: errUser } = await to(User.create(user));
    if (errUser) throw Bang.wrap(errUser);

    const roleMap = {
      principalType: 'USER',
      principalId: newUser.id,
      roleId: 3
    };

    const { data: newRoleMapping, err: errRole } = await to(RoleMapping.create(roleMap));
    if (errRole) throw Bang.wrap(errRole);

    currentUser = newUser;
  }

  // Note: Login user
  const userLogin = currentUser;

  var tokenId = uid(defaultTokenLength)

  const accessToken = {
    _id: tokenId,
    ttl: twoWeeksInSeconds,
    created: new Date(),
    userId: currentUser.id
  };

  const { data: newAccessToken, err: errAccessToken } = await to(AccessToken.create(accessToken));
  if (errAccessToken) throw Bang.wrap(errAccessToken);

  currentUser.role = { name: 'user' };
  newAccessToken.user = currentUser;
  newAccessToken.id = newAccessToken._id;

  ctx.body = newAccessToken;
}

export async function updateUser (ctx) {
  const User = ctx.app.models.user;
  const userId = ctx.state.user.id;
  const user = ctx.request.body;

  if (userId + '' !== user.id) {
    throw Bang.unauthorized();
  }

  const updateSentence = {
    name: user.name || '',
    address: user.address || '',
    waifu: user.waifu || '',
    description: user.description || '',
    image: user.image || '',
    background: user.background || '',
    url: user.url || ''
  };

  const { err } = await to(User.updateById(userId, updateSentence));
  if (err) throw Bang.wrap(err);

  ctx.body = updateSentence;
}

export async function requestRecoveryPassword (ctx) {
  const User = ctx.app.models.user;
  const RecoveryFolio = ctx.app.models.recoveryFolio;
  const email = ctx.request.body.email;

  if (!email) {
    throw Bang.badRequest();
  }

  const userFilter = {
    fields: ['username', 'email'],
    where: { email: email }
  };

  const { data: user, err } = await to(User.findOne(userFilter));
  if (err) throw Bang.wrap(err);
  if (!user) throw Bang.notFound('user with provided email does not exist');

  const destroyWhere = {
    userId: { inq: [user.id] }
  };

  const { err: errDestroy } = await to(RecoveryFolio.destroyAll(destroyWhere));
  if (errDestroy) throw Bang.wrap(errDestroy);

  const folio = shortid.generate();
  const recoveryFolio = {
    folio: folio,
    userId: user.id,
    expirationDate: moment().add(2, 'day')
  }

  const { data: newRecoveryFolio, err: errRecovery } = await to(RecoveryFolio.create(recoveryFolio));
  if (errRecovery) throw Bang.wrap(errRecovery);

  const emailOptions = {
    template: 'recovery-password',
    to: user.email,
    subject: user.username + ', tu recuperación de contraseña!',
    params: {
      username: user.username,
      folio: folio,
      appUrl: config.paths.app
    }
  };
  EmailSender.send(emailOptions);

  ctx.body = { ok: true };
}

export async function recoveryPassword (ctx) {
  const User = ctx.app.models.user;
  const RecoveryFolio = ctx.app.models.recoveryFolio;
  const recoveryParams = ctx.request.body;

  if (!recoveryParams.folio || !recoveryParams.newPassword) {
    throw Bang.badRequest();
  }

  const folioFilter = {
    where: { folio: recoveryParams.folio }
  };

  const { data: recoveryFolio, err } = await to(RecoveryFolio.findOne(folioFilter));
  if (err) throw Bang.wrap(err);
  if (!recoveryFolio) throw Bang.notFound('provided folio does not exist');

  if (moment().isAfter(moment(recoveryFolio.expirationDate))) {
    throw Bang.conflict('provided folio has expired');
  }
  const newPassword = recoveryParams.newPassword;
  if (typeof newPassword !== 'string' || newPassword.length > maxPasswordLength) {
    throw Bang.badRequest('newPassword exceeds max length');
  }

  const salt = bcrypt.genSaltSync(saltWorkFactor);
  const hashedPassword = bcrypt.hashSync(newPassword, salt);
  const updateStatement = { password: hashedPassword };

  const { data: count, err: errUser } = await to(User.updateById(recoveryFolio.userId, updateStatement));
  if (errUser) throw Bang.wrap(errUser);

  const userFilter = { fields: ['username', 'email'] };
  const { data: user, err: errUserFind } = await to(User.findById(recoveryFolio.userId, userFilter));
  if (errUserFind) throw Bang.wrap(errUserFind);

  const emailOptions = {
    template: 'recovery-password-success',
    to: user.email,
    subject: user.username + ', haz actualizado tu contraseña!',
    params: {
      username: user.username
    }
  };
  EmailSender.send(emailOptions);

  ctx.body = { ok: true };
}
