// 1.引入框架
// node项目采用 common.js，不能采用 import 引入，只能用 require 方式
const {
  response
} = require('express')
const express = require('express')
const cors = require('cors')
const request = require('request')
const mysql = require('mysql2');
const mime = require('mime');
const {
	addUser,getUsers,updateUser,deleteUser,addPost,getPosts,updatePost,deletePost,updateToken,getOpenidByToken
}  = require('./database.js');
const multer = require('multer');
const path = require('path');

// 2.创建应用
const app = express()
app.use(cors({
  origin: 'http://127.0.0.1:5173',
  credentials: true,
  allowedHeaders: ['Content-Type','token']
}))

const bodyParser = require('body-parser')

// 解析 url-encoded格式的表单数据
app.use(bodyParser.urlencoded({ extended: false }));
 
// 解析json格式的表单数据
app.use(bodyParser.json());


// 开发者信息
const wx = {
  appid: 'wx28630fe2ea21174c',
  secret: '5df63b472a771fa343ff02db1ec3169f'
}

// 3.创建路由规则
// get请求
app.get('/hello', (request, response) => {
  // 设置响应头 设置允许跨域
  response.setHeader('Access-Control-Allow-Origin', '*')
  // 设置响应体
  response.send('Hello node')
})

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const extname = path.extname(file.originalname);
    cb(null, 'image-' + Date.now() + extname);
  }
});

const upload = multer({ storage: storage });
app.post('/upload', upload.single('image'), function(req, res) {
  console.log(req.file);
  res.send('上传图片成功');
});

// 检查用户是否已经登录
app.get('/checklogin', (req, res) => {
let token = req.query.token;
console.log('token: '+token);
let is_login = false;
if(!token){
console.log('token不存在');
}else{
getOpenidByToken(token).then((openid) => {
if(openid) {
console.log(`token ${token}对应的openid是${openid},用户已登录`);
 is_login = true;
} else {
console.log(`找不到 token ${token}对应的openid`);
}
}).catch((err)=>{
console.error(`查询token ${token}时出错：${err}`);
});
}   
 res.json({
is_login
}) 
})

async function login(req, res) {
try {
const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${wx.appid}&secret=${wx.secret}&js_code=${req.body.code}&grant_type=authorization_code`;
const session = await new Promise((resolve, reject) => {
request(url, (err, response, body) => {
if (err) reject(err);
else resolve(JSON.parse(body));
});
});
const session_key = session.session_key;
const openid = session.openid;
await addUser(session_key, openid, 'avatar');
const token = 'token_' + new Date().getTime();
const id = await updateToken(openid, token);
console.log(`插入成功，id为${id}`);
res.json({
token: token
});
} catch (err) {
console.error(err);
res.status(500).json({ error: err.message });
}
}

app.post('/post',(req,res)=>{
const content = req.body.content;
const avatar = req.body.avatar;
const tmstamp = req.body.tmstamp;
console.log(content);
console.log(avatar);
console.log(tmstamp);
res.send('post successfully!');
});


app.post('/login', async (req,res) => {
await login(req,res);
})

// post请求
app.post('/server', (request, response) => {
  // 设置响应头 设置允许跨域
  response.setHeader('Access-Control-Allow-Origin', '*')
  // 设置所有相应头可用
  response.setHeader('Access-Control-Allow-Headers', '*')
  let query = request.query
  // 设置响应体，返回请求参数
  response.status(200).send(query)
})

// 接收用户编辑发帖内容
app.post('/postCard',(request, response) => {
 let text = request.body.text;
  response.status(200).send(text);
})

// 后台管理系统部分
app.post('/auth/admin_login', (request, response) => {
  // console.log(request.body);
  let result = {
    token: 'token',
    success: true
  };
  response.status(200).json(result);
})

// 服务端图片供应
app.get('/images/upload/:filename',(req,res)=>{
const fileName = req.params.filename;
const file = __dirname + '/uploads/' + fileName;
const mimeType = mime.getType(file); 

res.setHeader('Content-Type', mimeType);
res.sendFile(file);
});


// 4.监听端口启动服务
app.listen(3000, () => {
  console.log('服务启动成功');
})
