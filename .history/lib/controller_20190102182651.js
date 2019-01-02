const mongoose = require('mongoose')
const User = require('./model/user')

module.exports =
class Controller {
  constructor (options) {
    this.conn = mongoose.connect(options.dbURL)
  }

  // 判断用户是否已经存在， 不存在则保存
  async checkOrSave (user) {
    let userData = await User.findOne({ "UserName" : user.UserName }).exec()
    if (!userData) {
      userData = new User(user)
      const res = await userData.save()
      console.log(res)
    }

    console.log(userData)
  }
}