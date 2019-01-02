const mongoose = require('mongoose')
const User = require('./model/user')

module.exports =
class Controller {
  constructor (options) {
    this.conn = mongoose.connect(options.dbURL)
  }

  // 判断用户是否已经存在， 不存在则保存
  checkOrSave (user) {
    User.findOneAndUpdate({
      "UserName" : user.UserName
    },
    {
      ...user
    },
    {
      new: true,                       // return updated doc
      runValidators: true              // validate before update
    }).then(doc => {
      console.log(doc)
    })
    .catch(err => {
      console.error(err)
    })
  }
}