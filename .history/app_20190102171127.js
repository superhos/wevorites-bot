const log = require('debug')('INFO:Server:')
const path = require('path');
// Global
global.appRoot = path.resolve(__dirname);

async function startServer (id) {
  require('dotenv').config()

  // const bugsnag = require('bugsnag')
  // bugsnag.register(process.env.BUGSNAG_API_KEY)

  // process.on('unhandledRejection', (error) => {
  //   console.error(error.stack)
  //   bugsnag.notify(error)
  // })

  log('STARTING APP..')

  const Server = require('./lib/server')
  const server = new Server({
    loginDataCachePath: process.env.LOGIN_DATA_CACHE
  })
  await server.start()
  console.log(`Worker ${id} (pid: ${process.pid})`)
  return server
}

module.exports = { startServer }