async function startServer (id) {
  require('dotenv').config()

  // const bugsnag = require('bugsnag')
  // bugsnag.register(process.env.BUGSNAG_API_KEY)

  // process.on('unhandledRejection', (error) => {
  //   console.error(error.stack)
  //   bugsnag.notify(error)
  // })

  const Server = require('./lib/server')
  const server = new Service({
    mqURL: process.env.MQ_URL,
    hashSecret: process.env.HASH_SECRET,
    port: process.env.PORT || 3000
  })
  await server.start()
  console.log(`Worker ${id} (pid: ${process.pid})`)
  return server
}

module.exports = { startServer }