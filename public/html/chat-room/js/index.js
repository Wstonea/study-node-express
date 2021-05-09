let vm = new Vue({
    el: "#app",
    data() {
        return {
            connectStatus: false, // 连接状态
            name: "", //  网名
            msg: "", //  聊天内容
            ws: null, //  websocket 对象
            userList: [], //  用户列表
            allUser: 0, // 聊天人数
            newList: [], // 聊天列表
            myInfo: {}, // 自己的信息
            url: "ws://chatroom.cn.utools.club/ws/test"
        }
    },
    methods: {
        login() {
            if (!this.name) {
                this.$message({
                    type: "warning",
                    message: "请输入网名"
                })
                return
            }
            $.ajax({
                url: "http://chatroom.cn.utools.club/ws/login",
                method: "POST",
                data: {
                    name: this.name
                },
                success: (res) => {
                    console.log(res);
                    if (res.code == 200) {

                        this.myInfo = res.data.userList.filter(item => item.name == this.name)[0]
                        this.allUser = res.data.allUser
                        this.userList = res.data.userList
                        this.connect()
                    } else {
                        this.$message({
                            type: "error",
                            message: res.msg
                        })
                    }
                },
                error: err => {
                    console.log(err);

                    this.$message.error("服务器故障，请稍后再试~")
                }
            })
        },
        connect() {
            this.ws = new WebSocket(this.url);
            this.ws.onopen = () => {
                this.connectStatus = true
                    // this.ws.send(this.name + "进入聊天室")
            }
            this.ws.onmessage = this.message

            this.ws.onerror = () => {
                this.$notify.error({
                    title: '提示',
                    message: '连接错误'
                });
                this.connect()
            }
            this.ws.onclose = (d) => {
                console.log(d);
                if (d.type == 'close') {
                    this.$notify.error({
                        title: '提示',
                        message: "服务器故障，请稍后再试~"
                    });
                    setTimeout(() => {
                        clearInterval(this.timer)
                        this.connectStatus = false
                        this.name = "" //  网名
                        this.msg = "" //  聊天内容
                        this.ws = null //  websocket 对象
                        this.userList = [] //  用户列表
                        this.allUser = 0 // 聊天人数
                        this.newList = [] // 聊天列表
                        this.myInfo = {} // 自己的信息
                    }, 3000);
                }

            }
            this.timer = setInterval(() => {
                if (this.connectStatus) this.ws.send(JSON.stringify({
                    type: 'xt',
                    data: 666
                }))
            }, 3000);
        },
        send() {
            console.log(this.$refs);
            if (!this.msg) {
                this.$message({
                    type: "warning",
                    message: "发送内容不能为空，请重新输入"
                })
                return
            }
            this.ws.send(JSON.stringify({
                type: "msg",
                data: {
                    msg: this.msg,
                    name: this.myInfo.name,
                    avatar: this.myInfo.avatar
                }
            }))
            this.msg = ""
        },
        message(d) {
            let {
                data
            } = d
            let res = JSON.parse(data)
            if (res.type == "xt") {

            } else if (res.type == "user-join") {
                console.log(d);

                this.$notify.success({
                    title: '提示',
                    message: res.name + "加入了聊天室"
                });
                this.allUser = res.data.allUser
                this.userList = res.data.userList
            } else if (res.type == "leave") {
                this.$notify.info({
                    title: '提示',
                    message: res.name + "退出了聊天室"
                });
                this.allUser = res.data.allUser
                this.userList = res.data.userList
            } else if (res.type == "msg") { // 聊天
                console.log(res);

                this.newList.push(res.data)
                this.$nextTick(() => {
                    this.$refs.news.scrollTop = this.$refs.news.scrollHeight
                })
            }
        },
        close() {
            clearInterval(this.timer)
            this.ws.close()
            this.connectStatus = false
        }

    },
})