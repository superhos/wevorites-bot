const mongoose = require('mongoose')

module.exports =
class Controller {
  constructor (options) {
    this.conn = mongoose.createConnection(options.dbURL)
  }

  // 判断用户是否已经存在， 不存在则保存
  checkOrSave () {

  }
}