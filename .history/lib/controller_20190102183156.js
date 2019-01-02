const mongoose = require('mongoose')
const User = require('./model/user')

module.exports =
class Controller {
  constructor (options) {
    this.conn = mongoose.connect(options.dbURL)
  }

  // 判断用户是否已经存在， 不存在则保存
  async checkOrSave (user) {
    User
    .findOneAndUpdate(
      {
        "UserName" : user.UserName  // search query
      }, 
      {
        ...user   // field:values to update
      },
      {
        new: true,                       // return updated doc
        runValidators: true              // validate before update
      })
    .then(async doc => {
      if (!doc) {
        let userData = new User(user)
        await userData.save()
      }
    })
    .catch(err => {
      console.error(err)
    })
  }
}