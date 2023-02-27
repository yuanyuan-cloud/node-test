// 1.引入框架
// node项目采用 common.js，不能采用 import 引入，只能用 require 方式
const {
  response
} = require('express')
const express = require('express')

// 2.创建应用
const app = express()

// 3.创建路由规则
// get请求
app.get('/hello', (request, response) => {
  // 设置响应头 设置允许跨域
  response.setHeader('Access-Control-Allow-Origin', '*')
  // 设置响应体
  response.send('Hello node')
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
app.listen(8280, () => {
  console.log('服务已经启动，8280端口监听中...，点击http://localhost:8280');
})
