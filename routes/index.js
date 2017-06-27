var express = require('express');
var router = express.Router();
var path=require("path");
var moment=require("moment");   //时间控件
var formidable=require("formidable")   //表单控件
var User =require("../models/user");   //引入数据库user集合
var Post=require("../models/post")

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log("session:"+req.session)
  Post.find({},function(err,data){
    if(err){
      console.log(err)
      return res.redirect('/');
    }   
    res.render('index', { 
        title: '首页' ,
        posts:data,
        time:moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
    });
  })
  
});

//reg注册
router.get("/reg",function(req,res,next){
  res.render('reg',{title:"注册"})
})
router.post("/zhuce",function(req,res,next){   //如果reg.ejs中不加action,默认请求地址为当前页面路径，这里则为.post("/reg")
  var user=new User({
    username:req.body.username,
    password:req.body.password,
    email:req.body.email
  })
  if(req.body['password']!=req.body['password-repeat']){
    //req.flash('error','两次密码不一致')
    console.log("两次密码不一致")
    return res.redirect('/reg')
  }
  User.findOne({'username':user.username},function(err,data){
    if(err){
     // req.flash("error",err);
      console.log("err:"+err)
      return  res.redirect('/')
    }
    if(data!=null){
      //req.flash("err","该用户已存在");
      console.log('该用户已存在')
      return res.redirect('/reg')
    }else{
      //保存新用户
      user.save(function(err){    //user or User ? user is right.
        if(err){
          //req.flash("error",err);
          console.log(err)
          return res.redirect('/')
        }else{
          console.log('注册成功')
          res.redirect('/login')   
        }
      })
    }
  })
})

//login登录
router.get("/login",function(req,res,next){
  console.log(req.session)
  res.render('login',{
    title:"登录",
  })
})
router.post("/login",function(req,res,next){
  var username=req.body.username, password=req.body.password;
  User.findOne({"username":username},function(err,data){
    if(err){
      //req.flash("error","登录出错")
      return res.redirect('/');
    }
    if(!data){
      //req.flash("error","用户不存在")
      console.log("用户不存在")
      return res.redirect('/login')
    }else{
      if(data.password!=password){
        //req.flash("error","密码错误")
        console.log("密码错误")
        return res.redirect('/login')
      }
     // req.session.user=data;  //将用户信息存入session
      //req.flash("success","登录成功")

      console.log(username+":登录成功")
      res.redirect('/post');
    }
  })
})

//发表文章
router.get("/post",function(req,res,next){
  res.render('post',{title:"发表文章"})
})
router.post("/post",function(req,res,next){
  var imgPath=path.dirname(__dirname)+"/public/uploadImgs";    //path.dirname(__dirname) 返回项目路径，即/Users/lbw/Documents/lbw/learn/express/myapp2
  var form=new formidable.IncomingForm();  //创建上传表单
  form.encoding="utf-8";   //设置编辑
  form.uploadDir=imgPath; //设置上传目录
  form.keepExtensions=true; //保留后缀
  form.maxFieldsSize=5*1024*1024;   //文件大小
  form.type=true;
  form.parse(req,function(err,fields,files){
      if(err){
        console.log(err)
        return
      }
      console.log(fields)
      console.log(files)
      var file=files.postImg;   //获取上传文件信息
      if(file.type!="image/png" && file.type!="image/jpg" && file.type!="image/jpeg" && file.type!="image/gif"){
        console.log("图片格式不支持，只能是png,jpg,jpeg,gif")
        return;
      }
      var title=fields.title, author="吕博文",article=fields.article ,pv=fields.pv;
      var postImg=file.path.split(path.sep).pop();
      //校验参数
      try{
        if(!title.length){
          throw new Error("请填写标题")
        }
        if(!article.length){
          throw new Error("请填写内容")
        }
      }catch(e){
         console.log("catch:"+e.message);
         return
      }
      var post=new Post({     //创建实体（Model create Entity）
        title:title,
        author:author,
        article:article,
        postImg:postImg,
        publishTime:moment(new Date()).format('YYYY-MM-DD HH:mm:ss').toString(),
        pv:pv
      })
      post.save(function(err){
        if(err){
          console.log("文章发表出现错误")
          return res.redirect('/post')
        }
        console.log("文章录入成功")
        res.redirect('/')
      })
  })
})

//文章详情
router.get('/detail',function(req,res,next){
  var id=req.query.id;
  if(id && id!=""){
    Post.update({"_id":id},{$inc:{"pv":1}},function(err){    //更新pv加1
      if(err){
        console.log(err)
        return res.redirect("back");
      }
      console.log("pv+1")
    })
    Post.findById(id,function(err,data){      //查找单个
      if(err){
            console.log(err);
            return res.redirect('/post');
        }
        res.render("detail",{
            title:"文章展示",
            post:data,
            img:path.dirname(__dirname)+"/public/uploadImgs/"+data.postImg
        })
    })
  }
})

module.exports = router;

