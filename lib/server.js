const log = require('debug')('INFO:Server:')
const Wechat = require('wechat4u')
const qrcode = require('qrcode-terminal')
const fs = require('fs')
const request = require('request')
const path = require('path')
const controller = require('./controller')
const { isUrl } = require('./utils')

module.exports = 
class Server {
  constructor (options) {
    log('SERVER CONSTRUCT...')
    this.loginDataCachePath = options.loginDataCachePath
    this.controller = new controller(options)
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

        this.bot.on('message', msg => this.messageHandler(msg))
        resolve()
      })
  }

  async messageHandler (msg) {
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
    console.log(bot.contacts[msg.FromUserName].getDisplayName())

    // 检查用户信息
    this.controller.checkOrSave(bot.contacts[msg.FromUserName])
    
    switch (msg.MsgType) {
      case bot.CONF.MSGTYPE_TEXT:
        /**
         * 文本消息
         */
        console.log(msg.Content)
        // 如果是网址的话添加到Favorite
        if (isUrl(msg.Content)) {
          const res = await this.controller.addFavorite(msg.Content)
          console.log(res)
          if (res._id) {
            this.sendSuccess(res,msg)
          }
        }
        break
      // case bot.CONF.MSGTYPE_IMAGE:
      //   /**
      //    * 图片消息
      //    */
      //   console.log('图片消息，保存到本地')
      //   bot.getMsgImg(msg.MsgId).then(res => {
      //     fs.writeFileSync(`./media/${msg.MsgId}.jpg`, res.data)
      //   }).catch(err => {
      //     bot.emit('error', err)
      //   })
      //   break
      // case bot.CONF.MSGTYPE_VOICE:
      //   /**
      //    * 语音消息
      //    */
      //   console.log('语音消息，保存到本地')
      //   bot.getVoice(msg.MsgId).then(res => {
      //     fs.writeFileSync(`./media/${msg.MsgId}.mp3`, res.data)
      //   }).catch(err => {
      //     bot.emit('error', err)
      //   })
      //   break
      // case bot.CONF.MSGTYPE_EMOTICON:
      //   /**
      //    * 表情消息
      //    */
      //   console.log('表情消息，保存到本地')
      //   bot.getMsgImg(msg.MsgId).then(res => {
      //     fs.writeFileSync(`./media/${msg.MsgId}.gif`, res.data)
      //   }).catch(err => {
      //     bot.emit('error', err)
      //   })
      //   break
      // case bot.CONF.MSGTYPE_VIDEO:
      // case bot.CONF.MSGTYPE_MICROVIDEO:
      //   /**
      //    * 视频消息
      //    */
      //   console.log('视频消息，保存到本地')
      //   bot.getVideo(msg.MsgId).then(res => {
      //     fs.writeFileSync(`./media/${msg.MsgId}.mp4`, res.data)
      //   }).catch(err => {
      //     bot.emit('error', err)
      //   })
      //   break
      case bot.CONF.MSGTYPE_APP:
        if (msg.AppMsgType === 6) {
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
        } else if (msg.AppMsgType === 5 || msg.AppMsgType === 36) {
          // 连接分享
          // console.log(msg)
          console.log(`连接Title: ${msg.FileName}`)
          console.log(`连接Url: ${msg.Url}`)
          const res = await this.controller.addFavorite(msg)
          if (res._id) {
            this.sendSuccess(res,msg)
          }
        }

        break
      default:
        break
    }
  }

  sendSuccess (res,msg) {
    this.bot.sendMsg(`文章题目：${res.title} \n文章链接：${res.url} \n该链接已经成功保存到您的个人收藏夹上🍻 您的个人收藏夹网址为：`, msg.FromUserName)
    .catch(err => {
      this.bot.emit('error', err)
    })
    this.bot.sendMsg(`https://fav.chenhaotaishuaile.com/${msg.FromUserName}`, msg.FromUserName)
    .catch(err => {
      this.bot.emit('error', err)
    })
  }

  showQRCode (uuid) {
    qrcode.generate('https://login.weixin.qq.com/l/' + uuid, {
      small: true
    })
    console.log('二维码链接：', 'https://login.weixin.qq.com/qrcode/' + uuid)
  }
}