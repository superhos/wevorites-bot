const Wechat = require('wechat4u')
const qrcode = require('qrcode-terminal')
const fs = require('fs')
const request = require('request')
const path = require('path')

module.exports = 
class Server {
  constructor (options) {
    this.loginDataCachePath = options.loginDataCachePath
    this.initBot()
  }

  initBot () {
    console.log(path.resolve(appRoot,this.loginDataCachePath))
    try {
      this.bot = new Wechat(require(path.resolve(appRoot,this.loginDataCachePath)))
    } catch (e) {
      this.bot = new Wechat()
    }

    /**
     * 启动机器人
     */
    if (this.bot.PROP.uin) {
      // 存在登录数据时，可以随时调用restart进行重启
      this.bot.restart()
    } else {
      this.bot.start()
    }
  }
}