const log = require('debug')('INFO:Favorite:')
const { get, decode } = require('../utils')
const cheerio = require('cheerio')
const request = require('request-promise-native')

module.exports =
class FavoriteController {
  constructor (options) {
    this.options = options
  }

  // 增加Fav
  async addFavorite (session, fav) {
    return new Promise(async (resolve, reject) => {
      let member = session.sessionMember
      if (!member) return
      let favData
      if (typeof fav === 'string') {
        // 单纯网址的话需要获取网址内容
        const res = await get(fav)
        const $ = cheerio.load(res)
        favData = {
          "memberId" : member._id,
          "title": decode($('title').html()).toString(),
          "url": fav,
          "thumb": '', //$('img').length > 0 ? $('img')[0].attr('src') : '',
          "keyword": []
        } 
      } else {
        favData = {
          "memberId" : member._id,
          "title": fav.FileName,
          "url": fav.Url,
          "thumb": '',
          "keyword": []
        }
      }

      let options = {  
          url: `${this.options.webServer}/api/favorite`,
          method: 'POST',
          headers: {
            Authorization: session.token
          },
          form: {
            favData
          }
      }

      const resData = await request.post(options)

      resolve(JSON.parse(resData))
    })
  }
}