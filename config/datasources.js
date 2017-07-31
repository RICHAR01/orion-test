const env = process.env.NODE_ENV || 'development';
const config = require(`./datasources/${env}`);

export default config;
