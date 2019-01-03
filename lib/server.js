const log = require('debug')('INFO:Server:')
const Wechat = require('wechat4u')
const qrcode = require('qrcode-terminal')
const fs = require('fs')
const request = require('request')
const path = require('path')
const FavoriteController = require('./controller/favorite-controller')
const UserController = require('./controller/user-controller')
const MemberController = require('./controller/member-controller')
const { isUrl } = require('./utils')

module.exports = 
class Server {
  constructor (options) {
    log('SERVER CONSTRUCT...')
    this.githubClientId = options.githubClientId
    this.loginDataCachePath = options.loginDataCachePath
    this.userController = new UserController(options)
    this.favoriteController = new FavoriteController(options)
    this.memberController = new MemberController(options)

    this.webServer = options.webServer
    // Session 缓存
    this.sessionCache = {}
  }

  async start () {
    return new Promise((resolve) => {
      log('INIT BOT...')
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

    // 检查是否已经登录
    const session = await this.memberController.checkLogin(bot.contacts[msg.FromUserName].UserName)

    if (!session) {
      // 未登录 忽略当前消息 进入登录流程
      this.bot.sendMsg(`请先登录您的GitHub账号：`, msg.FromUserName)
      .then(() => {
        this.bot.sendMsg(`https://github.com/login/oauth/authorize?scope=user&client_id=${this.githubClientId}&state=${msg.FromUserName}`, msg.FromUserName)
      })
      .catch(err => {
        this.bot.emit('error', err)
      })
      return
    } 

    this.sessionCache[session.sessionKey] = session

    // console.log(session)

    // 检查微信用户信息
    this.userController.checkOrSave(bot.contacts[msg.FromUserName])
    
    switch (msg.MsgType) {
      case bot.CONF.MSGTYPE_TEXT:
        /**
         * 文本消息
         */
        // 如果是网址的话添加到Favorite
        if (isUrl(msg.Content)) {
          const res = await this.favoriteController.addFavorite(session.sessionMember, msg.Content).catch(err => console.err(err))
          console.log(res)
          if (res._id) {
            this.sendSuccess(res,msg,session)
          }
        }
        break
      case bot.CONF.MSGTYPE_APP:
        if (msg.AppMsgType === 5 || msg.AppMsgType === 33 || msg.AppMsgType === 36) {
          // 连接分享
          const res = await this.favoriteController.addFavorite(session.sessionMember, msg)
          if (res._id) {
            this.sendSuccess(res,msg,session)
          }
        }

        break
      default:
        break
    }
  }

  sendSuccess (res,msg,session) {
    this.bot.sendMsg(`文章题目：${res.title} \n文章链接：${res.url} \n该链接已经成功保存到您的个人收藏夹上🍻\n您的个人收藏夹网址为：`, msg.FromUserName)
    .then(() => {
      this.bot.sendMsg(`${this.webServer}/view/${session.sessionMember._id}`, msg.FromUserName)
      .catch(err => {
        this.bot.emit('error', err)
      })
    }).catch(err => {
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