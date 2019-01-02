const mongoose = require('mongoose')
const ObjectId = Schema.ObjectId;

const FavoriteSchema = new Schema({
  "_id": ObjectId,
  "title": {type: String},
  "url": {type: String},
  "thumb": {type: String},
  "create_at": { type: Date, default: Date.now },
})

module.exports = mongoose.model('Favorite', FavoriteSchema)