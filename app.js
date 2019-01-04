const log = require('debug')('INFO:Server:')
const path = require('path');
// Global
global.appRoot = path.resolve(__dirname);

async function startServer (id) {
  const Sentry = require('@sentry/node')
  require('dotenv').config()

  if (process.env.SENTRY_DSN) {
    Sentry.init({ dsn: process.env.SENTRY_DSN })
  }

  log('STARTING APP..')

  const Server = require('./lib/server')
  const server = new Server({
    loginDataCachePath: process.env.LOGIN_DATA_CACHE,
    dbURL: `${process.env.MONGO_INITDB_URL}/${process.env.MONGO_INITDB_DATABASE}`,
    githubClientId: process.env.GITHUB_CLIENT_ID,
    webServer: process.env.WEB_SERVER,
    receptEmail: process.env.RECEPT_EMAIL
  })
  await server.start()
  console.log(`Server is Running`)
  return server
}

module.exports = { startServer }