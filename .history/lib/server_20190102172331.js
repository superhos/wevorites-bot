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
        this.bot.on('uuid', uuid => {this.showQRCode(uuid)})

        this.bot.on('login', () => {
          fs.writeFileSync(path.resolve(appRoot,this.loginDataCachePath), JSON.stringify(this.bot.botData))
        })

        this.bot.on('logout', () => {
          fs.unlinkSync(path.resolve(appRoot,this.loginDataCachePath))
        })

        this.bot.on('message', msg => {
          console.log(`----------${msg.getDisplayTime()}----------`)
          /**
           * 获取消息发送者的显示名
           */
          console.log(this.bot.contacts[msg.FromUserName].getDisplayName())
        })
        resolve()
      })
  }

  messageHandler (msg) {
    const bot = this.bot
    /**
     * 获取消息时间
     */
    console.log(`----------${msg.getDisplayTime()}----------`)
    /**
     * 获取消息发送者的显示名
     */
    /**
     * 判断消息类型
     */
    console.log(msg)
    console.log(bot.contacts[msg.FromUserName].getDisplayName())
    switch (msg.MsgType) {
      case bot.CONF.MSGTYPE_TEXT:
        /**
         * 文本消息
         */
        console.log(msg.Content)
        break
      case bot.CONF.MSGTYPE_IMAGE:
        /**
         * 图片消息
         */
        console.log('图片消息，保存到本地')
        bot.getMsgImg(msg.MsgId).then(res => {
          fs.writeFileSync(`./media/${msg.MsgId}.jpg`, res.data)
        }).catch(err => {
          bot.emit('error', err)
        })
        break
      case bot.CONF.MSGTYPE_VOICE:
        /**
         * 语音消息
         */
        console.log('语音消息，保存到本地')
        bot.getVoice(msg.MsgId).then(res => {
          fs.writeFileSync(`./media/${msg.MsgId}.mp3`, res.data)
        }).catch(err => {
          bot.emit('error', err)
        })
        break
      case bot.CONF.MSGTYPE_EMOTICON:
        /**
         * 表情消息
         */
        console.log('表情消息，保存到本地')
        bot.getMsgImg(msg.MsgId).then(res => {
          fs.writeFileSync(`./media/${msg.MsgId}.gif`, res.data)
        }).catch(err => {
          bot.emit('error', err)
        })
        break
      case bot.CONF.MSGTYPE_VIDEO:
      case bot.CONF.MSGTYPE_MICROVIDEO:
        /**
         * 视频消息
         */
        console.log('视频消息，保存到本地')
        bot.getVideo(msg.MsgId).then(res => {
          fs.writeFileSync(`./media/${msg.MsgId}.mp4`, res.data)
        }).catch(err => {
          bot.emit('error', err)
        })
        break
      case bot.CONF.MSGTYPE_APP:
        if (msg.AppMsgType == 6) {
          /**
           * 文件消息
           */
          console.log('文件消息，保存到本地')
          bot.getDoc(msg.FromUserName, msg.MediaId, msg.FileName).then(res => {
            fs.writeFileSync(`./media/${msg.FileName}`, res.data)
            console.log(res.type);
          }).catch(err => {
            bot.emit('error', err)
          })
        }
        break
      default:
        break
    }
  }

  showQRCode (uuid) {
    qrcode.generate('https://login.weixin.qq.com/l/' + uuid, {
      small: true
    })
    console.log('二维码链接：', 'https://login.weixin.qq.com/qrcode/' + uuid)
  }
}