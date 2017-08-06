var mongoose = require('mongoose');

//模式。对数据库字段定义  关键函数 new mongoose.Schema({})类似于js里定义构造函数
//以后每添加一个电影对象都是该Schema的一个实例
/*
* @param  MovieSchema 首先定义数据库表(collection)的架构,通过mongoose模块的Schema({})方法创建一个
	名为MovieSchema的对象,该对象的属性对应数据表的字段名
*/
var MovieSchema = new mongoose.Schema({
	doctor: String,
	title: String,
	language: String,
	country: String,
	summary: String,
	flash: String,
	poster: String,
	year: Number,
	meta: {
		createAt:{
			type: Date,
			default: Date.now()
		},
		updateAt: {
			type: Date,
			default: Date.now()
		}
	}
});

/*
	pre中间件，相当于拦截器的作用，在执行save存储操作的时候拦截数据判断是更新数据还是插入新数据
	然后更改数据里面的update时间和create时间
	@param next 表示拦截器执行完毕的下一步操作
*/

MovieSchema.pre('save',function(next){
	if(this.isNew){  //this一般指向调用save函数的数据对象
		this.meta.createAt = this.meta.updateAt = Date.now()
	}
	else{
		this.meta.updateAt = Date.now()
	}

	next();
});

//用于取出目前数据库所有数据
MovieSchema.statics = {
	fetch: function(cb){
		return this.find({}).sort('meta.updateAt').exec(cb)
	},
	findById:function(id,cb){
		return this.findOne({_id:id}).exec(cb)
	}
}

module.exports = MovieSchema;