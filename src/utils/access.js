export async (ctx, next) => {
  if (ctx.state.usuario) {
    const parts = ctx.header.authorization.split(' ');
    let scheme;
    let credentials;
    let token;
    if (parts.length === 2) {
      scheme = parts[0];
      credentials = parts[1];

      if (/^Bearer$/i.test(scheme)) {
        token = credentials;
      }
      ctx.state.jwt = token;
    }
  } else {
    ctx.state.jwt = null;
  }
  await next();
}
/*

export default {
  // getHeader: function getHeader() {
  //   if (this.header.authorization) {
  //     const parts = this.header.authorization.split(' ');
  //     let scheme;
  //     let credentials;
  //     let token;
  //     if (parts.length === 2) {
  //       scheme = parts[0];
  //       credentials = parts[1];

  //       if (/^Bearer$/i.test(scheme)) {
  //         token = credentials;
  //       }
  //       return token;
  //     }
  //   }
  //   return null;
  // },
  middleware: async (ctx, next) => {
    if (ctx.state.usuario) {
      const parts = ctx.header.authorization.split(' ');
      let scheme;
      let credentials;
      let token;
      if (parts.length === 2) {
        scheme = parts[0];
        credentials = parts[1];

        if (/^Bearer$/i.test(scheme)) {
          token = credentials;
        }
        ctx.state.jwt = token;
      }
    } else {
      ctx.state.jwt = null;
    }
    await next();
  }
};
*/
