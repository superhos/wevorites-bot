const request = require('request-promise-native')

module.exports =
class MemberController {
  constructor (options) {
    this.options = options
  }

  // 判断用户是否已经存在， 不存在则保存
  async checkLogin (sessionKey) {
    const res = await request(`${this.options.webServer}/api/session/${sessionKey}`)
    return JSON.parse(res)
  }
}