// 1.引入框架
// node项目采用 common.js，不能采用 import 引入，只能用 require 方式
const {
  response
} = require('express')
const express = require('express')
const request = require('request')



// 2.创建应用
const app = express()

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

const db = {
  session_key: '',
  openid: ''

}

// 3.创建路由规则
// get请求
app.get('/hello', (request, response) => {
  // 设置响应头 设置允许跨域
  response.setHeader('Access-Control-Allow-Origin', '*')
  // 设置响应体
  response.send('Hello node')
})

// 检查用户是否已经登录
app.get('/checklogin', (req, res) => {
  var session = db.session_key
  res.json({
      is_login: session !== undefined
  })
})


app.post('/login', (req, res) => {
  console.log('code: ' + req.body.code);
  // code,appid,secret都有了就发起请求到微信接口服务校验
  var url = 'https://api.weixin.qq.com/sns/jscode2session?appid=' + wx.appid + '&secret=' + wx.secret + '&js_code=' + req.body.code + '&grant_type=authorization_code'
  request(url, (err, response, body) => {
    //	可以获取到 session_key(会话信息) 、 openid(用户唯一标识)
    // console.log('session: ' + body)
    //  上面的session信息是字符串数据，通过JSON.parse()转成js对象
    var session = JSON.parse(body)
    db.session_key = session.session_key;
    db.openid = session.openid;
    
  })
  let token = 'token_' + new Date().getTime();
  res.json({
    token: token
  })
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

// 4.监听端口启动服务
app.listen(3000, () => {
  console.log('服务启动成功');
})
