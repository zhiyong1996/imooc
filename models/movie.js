var mongoose = require('mongoose');
var MovieSchema = require('../schemas/movie');
// 利用mongoose的model方法把Schema编译成一个model，以供主程序调用
var Movie = mongoose.model('Movie',MovieSchema);

module.exports = Movie;