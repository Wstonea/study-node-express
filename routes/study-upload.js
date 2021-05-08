var fs = require('fs');
var express = require('express');
var router = express.Router();
var multer = require('multer');
var src = require("../utils/api")

// 对于上传文件需要 multer 库，npm i multer

// 上传单个文件
// tip: 如果上传接口直接报500，没有打印信息，请核对前后端文件上传表单的属性值是否一致
const avatarStorage = multer.diskStorage({
    destination(req,res,cb){
        cb(null,  'public/images/uploads/avatar/');// 文件保存路径，如果该路径的文件夹不存在则需要手动添加，不然500
    },
    filename(req,file,cb){
        let d = new Date();
        // 注意，在自定义给文件命名的时候不能直接添加文件类型，不然文件会出问题，图片访问会成乱码，其他的还未试
        cb(null, `${Math.random().toString(16).toLocaleUpperCase().slice(2,8)}${d.getFullYear()}${d.getMonth() + 1}${d.getDate()}${Math.random().toString(16).toLocaleUpperCase().slice(2,8)}`)// 文件名
    }
});
const uploadAvatar = multer({storage:avatarStorage});

router.post('/avatar', uploadAvatar.single("file"), function(req, res) {
    let file = req.file
    let tail = file.originalname.slice(file.originalname.lastIndexOf("."))
    fs.rename(//
        `public/images/uploads/avatar/${file.filename}`, // 源文件路径
        `public/images/uploads/avatar/${file.filename}${tail}`,// 更改后的路径（加上文件类型）
        err => {
            if (err) throw err
            
            res.send({
                code: 200,
                url: `${src}/images/uploads/avatar/${file.filename}${tail}`
            })
        }
    );
})

// 上传多个图片
let imgStorage = multer.diskStorage({
    // destination:"./public/images",
    destination(req, res, cb) {
        cb(null,  './public/images/uploads/article/')// 文件保存路径
    },
    filename(req, res, cb) {
        let head = Math.random().toString(16).slice(2,10)
        let tail = Math.random().toString(16).slice(2,10)
        cb(null, head + tail)
    }
})
// let uploadImgs = multer({dest: "./"})
let uploadImgs = multer({storage: imgStorage})

/*
uploadImgs.array('files',3)
    .array: 代表上传多个文件
    files: 文件上传表单的属性值，前后端要一致
    3：代表上传文件的数量, 如果上传的文件数量超过会直接500
*/
router.post("/imgs", uploadImgs.array('files',3), (req, res) => {
    let arr = []
    req.files.forEach(file => {
        let fileName = file.filename+file.originalname.slice(file.originalname.lastIndexOf("."))
        // tip: 读取的路径不能以当前文件为起点，而是导入该文件的文件路径为起点
        fs.renameSync(
            "./public/images/uploads/article/"+file.filename,
            "./public/images/uploads/article/"+fileName,
        )
        arr.push(`${src}/images/uploads/article/${fileName}`)
    })
    res.send({
        code: 200,
        data:{
            imgList: arr
        },
        msg: '上传成功'
    })
})

module.exports = router;