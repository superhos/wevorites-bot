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
    try {
      this.bot = new Wechat(require(path.resolve(appRoot,this.loginDataCachePath)))
    } catch (e) {
      this.bot = new Wechat()
    }
  }
}