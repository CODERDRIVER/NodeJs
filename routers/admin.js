var express = require('express');

var router = express.Router();
var User = require('../models/user');
var category = require("../models/category");
var Content = require("../models/content");
var Comment = require("../models/comment");

router.use(function(req, res, next) {
    if (!req.userInfo.isAdmin) {
        //如果当前用户不是管理员
        res.send("对不起，只有管理员才可以进入后台管理");
        return;
    }
    next();
});
//首页
router.get("/", function(req, res, next) {

    // res.send("后台管理首页");
    res.render("admin/index", { //注入用户信息
        userInfo: req.userInfo
    });
});
/**
 * 用户管理页面
 */
router.get("/user", function(req, res, next) {



    //查询数据库，得到所有user的信息
    /**
     * limit 限制数据的条数
     */
    var page = req.query.page || 1; //默认起始页
    var limit = 2; //每页显示的条数
    var skip = (page - 1) * limit;
    var pages = 0;
    //查询所有数据
    User.count().then(function(count) {
        pages = Math.ceil(count / 2); //总页数
        //最大页数
        page = Math.min(page, pages);
        //最小页数
        page = Math.max(page, 1);

        User.find().limit(limit).skip(skip).then(function(users) {
            res.render("admin/user_index", {
                userInfo: req.userInfo,
                pages: pages, //总页数
                count: count, //总记录数
                page: page, //当前页
                limit: limit, //每页显示的记录
                users: users
            })
        })
    })
});

/** 
 * 分类首页
 */
router.get("/category", function(req, res, next) {
    var page = req.query.page || 1;
    var limit = 2;
    var skip = (page - 1) * limit;
    category.count().then(function(count) {
        var pages = Math.ceil(count / 2);

        page = Math.min(page, pages);
        page = Math.min(page, 1);
        category.find().limit(limit).skip(skip).then(function(categories) {
            res.render("admin/category_index", {
                userInfo: req.userInfo,
                pages: pages,
                count: count,
                page: page,
                limit: limit,
                categories: categories
            })
            return Promise.reject();
        })
    })
});

/** 
 * 添加分类
 */
router.get("/category/add", function(req, res, next) {
    res.render("admin/category_add.html", {
        userInfo: req.userInfo
    })
});

/**
 * 增加分类的post请求
 */
router.post("/category/add", function(req, res, next) {
    var name = req.body.name || " ";
    if (name == " ") {
        //说明没有输入name值，返回到储出错页面
        res.render("admin/error", {
            userInfo: req.userInfo,
            message: "名称不能为空"
        })
        return;
    }
    category.findOne({
        name: name
    }).then(function(rs) {
        if (rs) {
            //说明数据库中已经有该记录
            res.render("admin/error", {
                userInfo: req.userInfo,
                message: "分类名称已经存在"
            })
            return Promise.reject();
        } else {
            return new category({
                name: name
            }).save();
        }

    }).then(function(newName) {
        res.render("admin/success", {
            userInfo: req.userInfo,
            message: "类别添加成功",
            url: "/admin/category"
        })
    })

});

/**
 * 类别修改
 */
router.get("/category/edit", function(req, res) {
    var id = req.query.id;
    category.findOne({
        _id: id
    }).then(function(category) {
        if (!category) {
            //索要修改的类别错误
            res.render("admin/error", {
                userInfo: req.userInfo,
                message: "要修改的类别名称不存在"
            })
        } else {
            res.render("admin/category_edit", {
                userInfo: req.userInfo,
                category: category
            })
        }
    })
});
/** 
 * 修改保存
 */
router.post("/category/edit", function(req, res) {
    var id = req.query.id;

    var name = req.body.name || ' ';

    category.findOne({
        _id: id
    }).then(function(rs) {
        if (!rs) {
            res.render("admin/error", {
                userInfo: userInfo,
                message: "分类信息不存在"
            })
            return Promise.reject();
        } else {
            //用户没有做任何修改
            if (name == rs.name) {
                res.render("admin/success", {
                    userInfo: req.userInfo,
                    message: "修改成功",
                    url: "/admin/category"
                })
            } else {
                //查看数据库中是否已经有了该名称
                category.find({
                    _id: { $ne: id },
                    name: name
                }).then(function(sameCategory) {
                    if (sameCategory) {
                        res.render("admin/error", {
                            userInfo: req.userInfo,
                            message: "该名称已经存在",
                            url: "/admin/category"
                        });
                        return Promise.reject();
                    } else {
                        return category.update({
                            _id: id
                        }, {
                            name: name
                        })
                    }
                }).then(function() {
                    res.render("admin/success", {
                        userInfo: userInfo,
                        message: "修改成功",
                        url: "/admin/category"
                    })
                })
            }
        }
    })
});
/**
 * 分类删除
 * 
 */
router.get("/category/delete", function(req, res) {
    var id = req.query.id || " ";

    category.remove({
        _id: id
    }).then(function() {
        res.render("admin/success", {
            userInfo: req.userInfo,
            message: "删除成功",
            url: "/admin/category"
        })
        return;
    })
});
/** 
 * 内容首页
 */
router.get("/content", function(req, res) {
    var page = req.query.page || 1;
    var limit = 2;
    var skip = (page - 1) * limit;
    var pages = 0;
    Content.count().then(function(count) {
        pages = Math.ceil(page / limit);
        page = Math.min(page, pages);
        page = Math.max(page, 1);
        Content.find().limit(limit).skip(skip).populate({
            path: 'category',
            model: category
        }).populate({
            path: 'user',
            model: User
        }).then(function(contents) {
            console.log(contents);
            res.render("admin/content_index", {
                userInfo: req.userInfo,
                pages: pages,
                page: page,
                count: count,
                limit: limit,
                contents: contents
            })
        })
    })
});
/** 
 * 
 * 添加内容
 */
router.get("/content/add", function(req, res) {

        //查询分类
        category.find().then(function(categories) {
            res.render("admin/content_add", {
                userInfo: req.userInfo,
                categories: categories
            })
        })
    })
    /**
     * 
     * 保存内容的post方法
     */
router.post("/content/add", function(req, res) {

    //判断所提交的分类是否为空
    if (req.body.category == '') {
        res.render("admin/error", {
            userInfo: req.userInfo,
            message: "内容分类不能为空"
        })
    }
    if (req.body.title == '') {
        res.render("admin/error", {
            userInfo: req.userInfo,
            message: "标题不能为空"
        })
    }
    new Content({
        category: req.body.category,
        title: req.body.title,
        user: req.userInfo._id.toString(),
        discription: req.body.discription,
        content: req.body.content
    }).save().then(function() {

        res.render("admin/success", {
            userInfo: req.userInfo,
            message: "添加成功",
            url: "/admin/content"
        })
    })

});
/**
 * 
 * 内容的修改
 */
router.get("/content/edit", function(req, res) {
    var id = req.query.id || '';
    var categories = [];
    category.find().then(function(rs) {
        categories = rs;
        return Content.findOne({
            _id: id
        })
    }).then(function(content) {
        if (!content) {
            //数据库中不存在
            res.render("admin/error", {
                userInfo: req.userInfo,
                message: "数据库中不存在该记录"
            })
        } else {
            res.render("admin/content_edit", {
                userInfo: req.userInfo,
                content: content,
                categories: categories
            });
        }
    });
});

/**
 * 内容修改的post请求
 */
router.post('/content/edit', function(req, res) {
    var id = req.query.id || '';
    Content.findOne({
            _id: id
        }).then(function(content) {
            if (!content) {
                res.render("admin/error", {
                    userInfo: req.userInfo,
                    message: "数据库中没有该条记录，修改失败"
                })
            } else {
                Content.update({
                    _id: id
                }, {
                    category: req.body.category,
                    title: req.body.title,
                    discription: req.body.discription,
                    content: req.body.content
                }).then(function() {
                    res.render("admin/success", {
                        userInfo: req.userInfo,
                        messgage: "保存成功",
                        url: "/admin/content"
                    })
                })
            }
        })
        //判断标题是否修改
});
/**
 * 内容删除
 */
router.get("/content/delete", function(req, res) {
    var id = req.query.id || '';
    Content.remove({
        _id: id
    }).then(function() {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: "删除成功",
            url: "/admin/content"
        })
    })
});
/**
 * 评论首页
 */
router.get("/comment", function(req, res) {

    Comment.find().then(function(comments) {
        res.render("admin/comment_index", {
            userInfo: req.userInfo,
            comments: comments
        })
    })

});
/**
 * 添加评论的get请求
 */
router.get('/comment/add', function(req, res) {
    //获得传过来的contentId
    var contentId = req.query.contentId;
    //查询数据库，看是否有该内容
    Content.findOne({
        _id: contentId
    }).populate('user').then(function(content) {
        if (!content) {
            //为空
            res.render("admin/error", {
                userInfo: req.userInfo,
                message: "该评论的文章不存在"
            })
        } else {
            //文章存在
            res.render("admin/comment_add", {
                userInfo: req.userInfo,
                content: content
            })
        }
    })
});
/**
 * 添加评论到数据库中
 */
router.post("/comment/add", function(req, res) {
    var detail = req.body.detail || '';
    var contentId = req.query.contentId;

    if (detail == '') {
        res.render("admin/error", {
            userInfo: req.userInfo,
            message: "评论不能为空"
        })
    } else {
        Content.findOne({
            _id: contentId
        }).then(function(content) {
            if (!content) {
                res.render("admin/error", {
                    userInfo: req.userInfo,
                    message: "没有该条记录"
                })
            } else {
                return new Comment({
                    content: content,
                    detail: detail
                }).save();
            }
        }).then(function() {
            res.render("admin/success", {
                userInfo: req.userInfo,
                message: "评论成功",
                url: "/admin/comment"
            })
        })
    }
});
/**
 * 评论删除
 */
router.get("/comment/delete", function(req, res) {
    var id = req.query.commentId;
    Comment.remove({
        _id: id
    }).then(function() {
        res.render("admin/success", {
            userInfo: req.userInfo,
            message: "删除成功",
            url: '/admin/comment'
        })
    })
});
module.exports = router;