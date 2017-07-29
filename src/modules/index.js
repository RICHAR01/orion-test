import glob from 'glob'
import Router from 'koa-router'

exports = module.exports = function initModules (app) {
  glob(`${__dirname}/*`, { ignore: '**/index.js' }, (err, matches) => {
    if (err) { throw err }

    matches.forEach((mod) => {
      const router = require(`${mod}/router`)

      const routes = router.default
      const baseUrl = router.baseUrl
      const instance = new Router({ prefix: baseUrl })

      routes.forEach((config) => {
        const {
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

            if (permissions.indexOf(user.role.name) === -1) {
              throw 'error-invalid-acces';
            }
            return next();
          } catch (err) {
            ctx.body = 'err' + err;
            ctx.status = 500;
            return ctx;
          }
        };

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
