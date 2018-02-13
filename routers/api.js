var express = require('express');

var router = express.Router();
var User = require("../models/user")

//统一返回对象
var responseData;
router.use(function(req, res, next) {
    responseData = {
        code: 0,
        msg: ""
    }
    next();
});
/**
 * 用户注册逻辑
 * 1.用户名不能为空
 * 2.密码不能为空
 * 3.确认密码必须一致
 * 
 * 用户名是否已经被注册 =>数据库查询
 */
router.post('/user/register', function(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    var repassword = req.body.repassword;


    if (username == '') {
        responseData.code = 1;
        responseData.msg = '用户名不能为空';
        res.json(responseData);
        return;
    }
    //密码不能为空
    if (password == "") {
        responseData.code = 2;
        responseData.msg = '密码不能为空';
        res.json(responseData);
        return;
    }
    if (password != repassword) {
        responseData.code = 3;
        responseData.msg = '两次密码不一致';
        res.json(responseData);
        return;
    }

    //判断用户名是已经被注册
    User.findOne({
        username: username
    }).then(function(userInfo) {
        if (userInfo) {
            //表示数据库中存在该记录
            responseData.code = 4;
            responseData.msg = "用户名已经被注册了";
            res.json(responseData);
            return;
        }
        //保存该用户到数据库中
        var user = new User({
            username: username,
            password,
            password
        });
        //保存
        return user.save().then(function(newUserInfo) {
            responseData.msg = "注册成功";
            res.json(responseData);
        });
    })
});

//登录路由
router.post('/user/login', function(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;

    if (username == "" || password == '') {
        responseData.code = 1;
        responseData.msg = "用户名和密码不能为空";
        res.json(responseData);
        return;
    }

    //查询用户名和密码是否存在
    User.findOne({
        username: username,
        password: password
    }).then(function(userInfo) {
        if (!userInfo) {
            responseData.code = 2;
            responseData.msg = "用户名或者密码错误";
            res.json(responseData);
            return;
        }

        //用户名和密码都正确
        responseData.code = 3;
        responseData.msg = "登陆成功";
        responseData.userInfo = {
            _id: userInfo._id,
            username: userInfo.username,
            isAdmin: userInfo.isAdmin
        };
        req.cookies.set('userInfo', JSON.stringify({
            _id: userInfo._id,
            username: userInfo.username,
            isAdmin: userInfo.isAdmin
        }));
        res.json(responseData);
        return;
    })
})

//退出
router.get('/user/logout', function(req, res, next) {
    req.cookies.set('userInfo', null);
    responseData.msg = '退出成功';
    res.json(responseData);
    // res.render("main/index");
    return;
})

module.exports = router;