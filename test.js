var path = require('path')
// var fs = require('fs')
// let ws = require('express-ws')
// var express = require('express');
// var router = express.Router();
// var studyWebsoket = require('./routes/study-websoket')

var cookieParser = require('cookie-parser');
var logger = require('morgan');
var express = require("express");
var expressWs = require("express-ws");
var app = express();
expressWs(app);  //将 express 实例上绑定 websock 的一些方法
app.all('*', (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    // res.header("Access-Control-Allow-Headers", "X-Requested-With");
    // res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    // res.header("X-Powered-By",' 3.2.1')
    // res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.ws("/socketTest", function (ws, req) {
    console.log('connect success')
    console.log(ws)

    // 使用 ws 的 send 方法向连接另一端的客户端发送数据
    ws.send('connect to express server with WebSocket success')

    // 使用 on 方法监听事件
    //   message 事件表示从另一段（服务端）传入的数据
    ws.on('message', function (msg) {
        console.log(`receive message ${msg}`)
        ws.send('default response')
    })

    // 设置定时发送消息
    let timer = setInterval(() => {
        ws.send(`interval message ${new Date()}`)
    }, 2000)

    // close 事件表示客户端断开连接时执行的回调函数
    ws.on('close', function (e) {
        console.log('close connection')
        clearInterval(timer)
        timer = undefined
    })
});
app.listen(3002);
console.log("Listening on port 3002...");
// let expressWs = require('express-ws')

// expressWs(router)
