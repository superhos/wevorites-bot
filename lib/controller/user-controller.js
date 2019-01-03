const mongoose = require('mongoose')
const request = require('request-promise-native')
module.exports =
class UserController {
  constructor (options) {
    this.conn = mongoose.connect(options.dbURL)
    this.user = null
    this.options = options
  }

  // 判断用户是否已经存在， 不存在则保存
  async checkOrSave (user) {
    const options = {  
      url: `${this.options.webServer}/api/user`,
      form: {
        user
      }
    }
    const res = await request.post(options)

    return JSON.parse(res)
  }
}