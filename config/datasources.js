const env = process.env.NODE_ENV || 'development';
const config = require(`./datasources.${env}`);

console.log('using ds:', config);

export default config;
