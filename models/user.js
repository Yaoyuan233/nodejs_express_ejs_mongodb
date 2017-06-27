var mongoose=require("mongoose");
var config=require("../config/config");
mongoose.connect(config.mongodb);    //连接数据库

var userSchema=new mongoose.Schema({
    username:String,
    password:String,
    email:String
})
//这里会数据库会创建一个user集合
module.exports=mongoose.model("User",userSchema)