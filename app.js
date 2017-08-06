var express = require('express');//---------express 本程序的核心模块，网站的基本功能实现
var bodyParser = require('body-parser');
var path = require('path');//-----------node的工具模块，可以用来处理路径
var mongoose = require('mongoose');//-------mongoose模块.需要npm install。类似数据库驱动，为程序提供数据库操作功能
var _ = require('underscore');//------------underscore.js模块。需要npm install该模块提供一系列工具函数
var Movie = require('./models/movie');//--------自定义的模块，用于创建数据库和对数据库进行操作
var port = process.env.PORT || 3000;//---------获取本程序的端口号
var app = express();

mongoose.connect('mongodb://localhost/imooc',{useMongoClient: true});//-------------连接本地mongoDB

app.set('views','./views/pages');//-----------设置模板视图文件所在目录
app.set('view engine','jade');//------------设置模板引擎,告知程序使用jade模板渲染页面

app.use(bodyParser.urlencoded({extended: true}));//表单格式化
app.use(express.static(path.join(__dirname,'public')));//利用path模块加载public目录下的静态资源文件jquery,bootstrap
app.locals.moment = require('moment');//moment.js 一个日期格式化组件，用于在列表页面把数据库的Date对象格式化YYYY/MM/DD
//设置成调用了app.locals，moment对象贯穿整个程序的生命周期，可以在模版页面使用该对象

app.listen(port);//-------------监听接口,表示程序开始运行

console.log('imooc star '+port);

/*
*配置路由，即浏览器输入url的时候返回相应的视图页面
*/
//首页视图
app.get('/',function(req,res){
	Movie.fetch(function(err,movies){
		if(err){
			console.log(err);
		}
		res.render('index',{
			title: 'imooc 首页',
			movies:movies
		})
	})
})

//详情页视图
//@param id 对应数据库中document的id，即是电影id;
app.get('/movie/:id',function(req,res){
	var id = req.params.id;

	Movie.findById(id,function(err,movie){
		res.render('detail',{
			title: 'imooc' + movie.title,
			movie: movie
		})
	})
})

//后台录入表单-------如果是非更新操作，传入一个movie对象，属性值为空
app.get('/admin/movie',function(req,res){
	res.render('admin',{
		title: 'imooc 后台录入页',
		movie: {
			title: '',
			doctor: '',
			country: '',
			year: '',
			poster: '',
			flash: '',
			summary: '',
			language: ''
		}
	})
})

//admin udpate movie  更新页根据id查询相应的document对象，movie，并且传到admin页面
app.get('/admin/update/:id',function(req,res){
	var id = req.params.id;
	if(id){
		Movie.findById(id,function(err,movie){
			res.render('admin',{
				title: 'imooc 后台更新页面',
				movie: movie
			});
		});
	}
});

//admin post movie  表单提交..用于更新已有电影信息或者录入新电影
/*	
	line:98 中的代码 _.extend(obj1,obj2); 这是underscore.js中的一个方法
	该方法会将obj2里面的属性添加到obj1,并且返回前一个对象,如果有相同的属性就会覆盖
	这里用于更新movie对象，覆盖原有的属性值
*/
app.post('/admin/movie/new',function(req,res){
	var id = req.body.movie._id;
	var movieObj = req.body.movie;
	var _movie;

	if(id != 'undefined'){
		Movie.findById(id,function(err,movie){
			if(err){
				console.log(err);
			}
			_movie = _.extend(movie,movieObj);
			_movie.save(function(err,movie){
				if(err){
					console.log(err);
				}
				//更新完毕重定向到detail页面
				res.redirect('/movie/'+movie.id);
			})
		})
	}else{
		//创建一个新的电影对象，通过movie模块的save方法录入数据库
		_movie = new Movie({
			doctor: movieObj.doctor,
			title: movieObj.title,
			country: movieObj.country,
			language: movieObj.language,
			year: movieObj.year,
			poster: movieObj.poster,
			summary: movieObj.summary,
			flash: movieObj.flash
		})

		_movie.save(function(err,movie){
			if(err){
				console.log(err);
			}
			//添加数据成功时重定向到detail页面
			res.redirect('/movie/'+movie.id);
		})
	}
})

app.get('/admin/list',function(req,res){
	Movie.fetch(function(err,movies){
			if(err){
				console.log(err)
			}
		res.render('list',{
		title: 'imooc 列表页',
		movies: movies
		})
	})	
})

//list delete movie
app.delete('/admin/list',function(req,res){
	var id = req.query.id;

	if(id){
		Movie.remove({_id:id},function(err,movie){
			if(err){
				console.log(err)
			}else{
				res.json({success: 1});
			}
		});
	}
});