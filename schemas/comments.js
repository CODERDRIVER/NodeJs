var mongoose = require("mongoose");

module.exports = mongoose.Schema({
    //评论的文章
    content: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Content'
    },
    //评论的内容
    detail: String
});