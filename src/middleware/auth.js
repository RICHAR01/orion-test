import User from '../models/users'
import AccessToken from '../models/accessToken'
import config from '../../config'

export async function ensureUser (ctx, next) {
  const token = ctx.header.authorization;
  if (!token) return next();

  const accessToken = await AccessToken.findOne({ _id: token });
  if (!accessToken) return next();

  const currentDate = new Date();
  const creationDate = new Date(accessToken.created);
  const expirationDate = creationDate.setSeconds(creationDate.getSeconds() + accessToken.ttl);
  const isTokenAlive = (currentDate.getTime() < creationDate.getTime());
  if (!isTokenAlive) return next();

  let user = await User.findOne({ _id: accessToken.userId }, '-password')
  if (!user) return next();

  user = user.toJSON();

  user.role = config.roles[user.roleId];

  ctx.state.user = user;

  return next()
}
