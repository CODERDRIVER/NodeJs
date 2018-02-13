var mongoose = require("mongoose");

module.exports = mongoose.Schema({

    //category
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Content'
    },
    //用户
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    //时间
    addTime: {
        type: Date,
        default: new Date()
    },
    //点击量
    views: {
        type: Number,
        default: 0
    },
    //内容标题
    title: String,
    //内容简介
    discription: String,
    //内容
    content: String
})