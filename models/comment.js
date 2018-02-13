var mongoose = require("mongoose");

var commentSchema = require("../schemas/comments");

module.exports = mongoose.model("Comment", commentSchema);