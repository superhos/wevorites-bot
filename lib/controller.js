const mongoose = require('mongoose')
const User = require('./model/user')
const Favorite = require('./model/favorite')
const { request, decode } = require('./utils')
const cheerio = require('cheerio')

module.exports =
class Controller {
  constructor (options) {
    this.conn = mongoose.connect(options.dbURL)
    this.user = null
  }

  // 增加Fav
  async addFavorite (fav) {
    if (!this.user) return
    let favData
    if (typeof fav === 'string') {
        // 单纯网址的话需要获取网址内容
      const res = await request(fav)
      const $ = cheerio.load(res)
      console.log($('title').html())
      favData = {
        "userId" : this.user._id,
        "title": decode($('title').html()).toString(),
        "url": fav,
        "thumb": '', //$('img').length > 0 ? $('img')[0].attr('src') : '',
        "keyword": []
      } 
    } else {
      favData = {
        "userId" : this.user._id,
        "title": fav.FileName,
        "url": fav.Url,
        "thumb": '',
        "keyword": []
      }
    }

    const favObj = new Favorite(favData)
    const res = await favObj.save()
    return res
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
        doc = await userData.save()
      }

      this.user = doc
    })
    .catch(err => {
      console.error(err)
    })
  }
}