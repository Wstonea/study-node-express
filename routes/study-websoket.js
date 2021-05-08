var express = require('express');
var router = express.Router();

let expressWs = require('express-ws')
let geoip = require('geoip-lite');
expressWs(router)
/**
 * 下载express-ws库， npm i express-ws -S
 * 
 * 由于 express-ws 在默认不添加server 参数情况下，
 * 使用的是app.listen 创建的httpserver,
 * 而express 脚手架将 app和server初始化分离了，
 * 所以需要再次配置express-ws
 * 在 www文件 里添加 var expressWs = require('express-ws')(app, server);
 */

router.get("/", (req, res) => {
    res.json({
        code: 200,
        data: {
            a:1,
            ip: get_client_ip(req),
            addr: geoip.lookup(get_client_ip(req))
        }, 
        msg: '请求成功'
    })
})

router.ws("/test", (ws, req) => {
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
})

var get_client_ip = function (req) {
    var ipStr = req.headers['x-forwarded-for'] ||
        req.ip ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress || '';
    var ipReg = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
    if (ipStr.split(',').length > 0) {
        ipStr = ipStr.split(',')[0]
    }
    var ip = ipReg.exec(ipStr);
    return ip[0];
};


module.exports = router