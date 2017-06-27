var mongoose=require("mongoose");
var config=require("../config/config");
mongoose.connect(config.mongodb);
var PostSchema=new mongoose.Schema({
    title:String,
    author:String,
    article:String,
    publishTime:String,  //发表时间
    postImg:String,     //封面
    comments:[{     //评论
        name:String,
        time:String,
        content:String,
    }],
    pv:Number     //访问次数
})
module.exports=mongoose.model("Post",PostSchema)