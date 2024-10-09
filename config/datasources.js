const env = process.env.NODE_ENV || "development";
const MONGO_URL = process.env.MONGO_URL || null;
const config = require(`./datasources/${env}`);

// Set env variables for DB connection
if (MONGO_URL) {
  console.log(
    `Env variable MONGO_URL available, overring db connection name 'mongodb' with new connection url.`
  );
  const mongoDBIndex = config.findIndex((x) => x.name === "mongodb");
  config[mongoDBIndex].url = MONGO_URL;
}

export default config;
