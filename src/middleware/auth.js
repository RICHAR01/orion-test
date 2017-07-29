import config from '../../config'

export async function ensureUser (ctx, next) {
  const User = ctx.app.models.user;
  const AccessToken = ctx.app.models.AccessToken;

  const token = ctx.header.authorization;
  if (!token) return next();

  const accessToken = await AccessToken.findOne({ where: { id: token } });
  if (!accessToken) return next();

  const currentDate = new Date();
  const creationDate = new Date(accessToken.created);
  const expirationDate = creationDate.setSeconds(creationDate.getSeconds() + accessToken.ttl);
  const isTokenAlive = (currentDate.getTime() < creationDate.getTime());
  if (!isTokenAlive) return next();

  let user = await User.findOne({ where: { id: accessToken.userId } });
  if (!user) return next();

  user.role = config.roles[user.roleId];

  ctx.state.user = user;

  return next()
}
