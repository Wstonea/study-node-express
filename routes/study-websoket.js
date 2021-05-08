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


let userList = []
let count = 0
let wsList = []
router.post("/login", (req, res) => {
    console.log("wsList.length:", wsList.length);
    if (userList.filter(item => item.name == req.body.name).length > 0) {
        res.send({
            code: 201,
            msg: '该网名已存在，请重新输入'
        })
    }

    count++
    userList.push({
        id: count,
        name: req.body.name,
        ip: get_client_ip(req),
        addr: geoip.lookup(get_client_ip(req))
    })
    if (wsList.length > 0) {
        wsList.forEach(ws => {
            ws.send(JSON.stringify({
                type: "user-join",
                name: req.body.name,
                userList
            }))
        })
    }
    res.send({
        code: 200,
        data: {
            allUser: count,
            userList
        },
        msg: '登录成功'
    })
})

router.ws("/test", (ws, req) => {
    console.log('connect success', )
    ws.id = count

    wsList.push(ws)
        // 使用 ws 的 send 方法向连接另一端的客户端发送数据
        // ws.send('connect to express server with WebSocket success')

    // 使用 on 方法监听事件
    //   message 事件表示从另一段（服务端）传入的数据
    ws.on('message', function(msg) {
        if (msg.includes('xt')) {
            ws.send('666')
        }
    })

    // close 事件表示客户端断开连接时执行的回调函数
    ws.on('close', function(e) {
        // if (arr.length > 0) {

        //     ws.send(889)
        // }
        let current = userList.filter(item => item.id == ws.id)
        userList = userList.filter(item => item.id != ws.id)
        wsList = wsList.filter(item => item.id != ws.id)
        if (wsList.length > 0) {
            wsList.forEach(iWs => {
                iWs.send(JSON.stringify({
                    type: "leave",
                    name: current[0].name
                }))
            })
        }
        console.log('close connection', ws.id)
    })
})

var get_client_ip = function(req) {
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