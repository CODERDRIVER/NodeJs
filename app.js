/**
 * 应用程序的入口文件
 */

//加载express模块
var express = require("express");

//加载模板

var swig = require("swig");


//创建app应用
var app = express();

//创建mongodb 模块
var mongoose = require('mongoose');

//加载body-parser模块，用来处理post请求的数九
var bodyParser = require('body-parser');

//获得cookies信息
var Cookies = require('cookies');

var User = require("./models/user");

//设置bodyParser
app.use(bodyParser.urlencoded({
    extended: true
}));

//设置cookie
app.use(function(req, res, next) {
    req.cookies = new Cookies(req, res);

    //解析登录用户的cookie信息
    var userInfo = {};
    if (req.cookies.get("userInfo")) {
        try {
            req.userInfo = JSON.parse(req.cookies.get("userInfo"));
            //查询是否是管理员
            User.findById(req.userInfo._id).then(function(userInfo) {
                req.userInfo.isAdmin = Boolean(userInfo.isAdmin);
            })
        } catch (e) {

        }
    }
    next();
})

//设置静态文件托管
app.use('/public', express.static(__dirname + '/public'));

//配置模板
//定义当前的模板引擎
//第一个参数模板引擎的名称，同时也是模板文件的后缀
//第二个参数表示用来处理模板文件内容的方法
app.engine("html", swig.renderFile);
//设置模板文件的目录
app.set('views', './views');
//注册所使用的模板引擎
app.set('view engine', 'html');

//开发过程中，取消缓存
swig.setDefaults({
    cache: false
})

/**
 * 首页
   req: request
   res：response
   next: 函数
 */
//   app.get('/',function(req,res,next){
//     //   res.send("<h1>欢迎来到首页</h1>");
//     /**
//      * 用来处理views目录吓得模板文件，并且返回给客户端
//      */
//     res.render('index');
//   })
/**
 * 根据不同的url,划分不同的模块
 */
app.use('/admin', require('./routers/admin'));
app.use('/api', require('./routers/api'));
app.use('/main', require('./routers/main'));
app.use('/', require('./routers/main'));

//监听8081端口

mongoose.connect("mongodb://localhost:27017/blog", function(err) {
    if (err) {
        console.log("连接失败");
    } else {
        console.log("连接成功");
        app.listen(8081);
    }
})