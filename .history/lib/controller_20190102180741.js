
module.exports =
class Controller {
  constructor (options) {
    this.conn = mongoose.createConnection(options.dbURL);
  }
}