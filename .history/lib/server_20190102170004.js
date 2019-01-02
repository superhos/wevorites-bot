const Wechat = require('wechat4u')

module.exports = 
class Server {
  constructor (options) {
    this.loginDataCachePath = options.loginDataCachePath
    this.initBot()
  }

  initBot () {
    try {
      this.bot = new Wechat(require('./sync-data.json'))
    } catch (e) {
      this.bot = new Wechat()
    }
  }
}