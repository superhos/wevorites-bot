const log = require('debug')('INFO:Server:')
const Wechat = require('wechat4u')
const qrcode = require('qrcode-terminal')
const fs = require('fs')
const request = require('request')
const path = require('path')

module.exports = 
class Server {
  constructor (options) {
    log('SERVER CONSTRUCT...')
    this.loginDataCachePath = options.loginDataCachePath
  }

  async start () {
    return new Promise((resolve) => {
      log('INIT BOT...')
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
        this.bot.on('uuid', () => {this.showQRCode(uuid)})

        resolve()
      })
  }

  showQRCode (uuid) {
    qrcode.generate('https://login.weixin.qq.com/l/' + uuid, {
      small: true
    })
    console.log('二维码链接：', 'https://login.weixin.qq.com/qrcode/' + uuid)
  }
}