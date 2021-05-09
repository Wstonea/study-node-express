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
let aratarList = [
    "https://ss0.bdstatic.com/70cFvHSh_Q1YnxGkpoWK1HF6hhy/it/u=2084118128,2518711034&fm=26&gp=0.jpg",
    "https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=4140499325,1931790298&fm=26&gp=0.jpg",
    "https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=772235982,2085627175&fm=26&gp=0.jpg",
    "https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=3592110485,2742735970&fm=26&gp=0.jpg",
    "https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=2909072015,3629141008&fm=26&gp=0.jpg",
    "https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=4264181808,2128553240&fm=26&gp=0.jpg",
    "https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=3649178992,1821853682&fm=26&gp=0.jpg",
    "https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=2819344467,1935426999&fm=26&gp=0.jpg",
    "https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=3757239321,1175359126&fm=26&gp=0.jpg",
    "https://ss0.bdstatic.com/70cFvHSh_Q1YnxGkpoWK1HF6hhy/it/u=3279074139,2537768719&fm=11&gp=0.jpg"
]

let userList = []
let count = 0
let wsList = []
router.post("/login", (req, res) => {
    console.log("wsList.length:", wsList.length, userList.length);
    if (userList.filter(item => item.name == req.body.name).length > 0) {
        res.send({
            code: 201,
            msg: '该网名已存在，请重新输入'
        })
    } else {
        count++
        userList.push({
            id: count,
            name: req.body.name,
            ip: get_client_ip(req),
            addr: geoip.lookup(get_client_ip(req)),
            joinTime: getTime(),
            avatar: aratarList[Math.floor(Math.random() * 10)]
        })
        if (wsList.length > 0) {
            wsList.forEach(ws => {
                ws.send(JSON.stringify({
                    type: "user-join",
                    name: req.body.name,
                    data: {
                        allUser: count,
                        userList
                    }
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
    }
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
        let res = JSON.parse(msg)
        if (res.type == 'xt') { // 心跳
            ws.send('666')
        } else if (res.type == 'msg') { // 聊天
            wsList.forEach(ws => {
                ws.send(JSON.stringify({
                    type: "msg",
                    data: {
                        text: res.data.msg,
                        name: res.data.name,
                        time: getTime(),
                        avatar: res.data.avatar
                    }
                }))
            })
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
                    name: current[0].name,
                    data: {
                        allUser: count,
                        userList
                    }
                }))
            })
        }
        count--
        console.log('close connection', ws.id)
        console.log(wsList.length, userList.length);

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

function getTime() {
    var date = new Date(),
        year = date.getFullYear(),
        month = date.getMonth() + 1,
        day = date.getDate(),
        hour = date.getHours() < 10 ? "0" + date.getHours() : date.getHours(),
        minute = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes(),
        second = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
    month >= 1 && month <= 9 ? (month = "0" + month) : "";
    day >= 0 && day <= 9 ? (day = "0" + day) : "";
    var timer = year + '/' + month + '/' + day + ' ' + hour + ':' + minute + ':' + second;
    return timer;
}


module.exports = router