export function queryParserMiddleware () {
  function isJsonString(stringProperty) {
    try {
      JSON.parse(stringProperty)
    } catch (e) {
      return false;
    }
    return true;
  }
  
  return async (ctx, next) => {
    Object.keys(ctx.query).map(propertyName => {
      if (isJsonString(ctx.query[propertyName])) {
        ctx.query[propertyName] = JSON.parse(ctx.query[propertyName])
      }
    })
    return next()
  }
}
