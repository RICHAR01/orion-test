import glob from 'glob'
import Router from 'koa-router'
import Bang from 'bang';

exports = module.exports = function initModules (app) {
  glob(`${__dirname}/*`, { ignore: '**/index.js' }, (err, matches) => {
    if (err) { throw err }

    matches.forEach((mod) => {
      const router = require(`${mod}/router`)

      const routes = router.default
      const baseUrl = router.baseUrl
      const instance = new Router({ prefix: baseUrl })

      routes.forEach((config) => {
        let {
          method = '',
          route = '',
          handlers = [],
          permissions = []
        } = config

        const validatePermissions = async (ctx, next) => {

          // TODO: Agregar manejador de errores
          try {
            if (permissions === '*') return next();

            const user = ctx.state.user;

            if (!user || !user.role) {
              throw 'error-invalid-acces';
            }

            if (permissions === 'authenticated') return next();

            if (permissions.indexOf(user.role.name) === -1) {
              throw Bang.unauthorized('Invalid token');
            }
            return next();
          } catch (err) {
            console.log('err:',err);
            ctx.body = 'err' + err;
            ctx.status = 500;
            return ctx;
          }
        };

        const manageHandlerErr = function(handler) {
          return async function(ctx, next) {
            try {
              await handler(ctx, next);
            }
            catch (err) {
              ctx.body = err;
              ctx.status = (ctx.body.output && ctx.body.output.statusCode) || 500;
            }
          }
        };

        handlers = handlers.map(handler => manageHandlerErr(handler));

        handlers.unshift(validatePermissions);
        const lastHandler = handlers.pop()

        instance[method.toLowerCase()](route, ...handlers, async function(ctx) {
          return await lastHandler(ctx)
        })

        app
          .use(instance.routes())
          .use(instance.allowedMethods())
      })
    })
  })
}
