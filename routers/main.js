var express = require('express');

var router = express.Router();

var Category = require("../models/category");
var Content = require("../models/content");
var data = {
    userInfo: {},
    categories: []
};
/**
 * 全局响应
 */
router.use(function(req, res, next) {
    data.userInfo = req.userInfo;
    Category.find().then(function(categories) {
        data.categories = categories;
    });
    next();
});

/**
 * 首页
 */
router.get('/user', function(req, res, next) {
    // var data = {
    //     userInfo: req.userInfo,
    //     category: req.query.category || '',
    //     categories: [],
    //     page: Number(req.query.page || 1),
    //     limit: 5,
    //     count: 0,
    //     contents: [],
    //     pages: 0
    // }
    data.category = req.query.category || '';
    data.page = Number(req.query.page || 1);
    data.limit = 5;
    data.count = 0;
    data.contents = [];
    data.pages = 0;
    var where = {};
    if (data.category != '') {
        where.category = data.category;
    }

    // res.send('main User');
    Category.find().then(function(categories) {
        data.categories = categories;
        //查询内容
        return Content.count();
    }).then(function(count) {
        data.pages = Math.ceil(count / 2);
        data.page = Math.min(data.page, data.pages);
        data.page = Math.max(data.page, 1);
        data.count = count;
        var skip = (data.page - 1) * data.limit;


        return Content.where(where).find().limit(data.limit).skip(skip).populate(["category", "user"]).sort({
            addTime: -1 //按照降序排序
        });
    }).then(function(contents) {
        data.contents = contents;
        res.render("main/index", data);
    })

});
router.get("/view", function(req, res, next) {
    var contentId = req.query.contentId;
    Content.findOne({
        _id: contentId
    }).then(function(content) {
        data.content = content;
        res.render("main/view", data);
    })
})
module.exports = router;