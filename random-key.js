const BSV = require('bsv') //引用bsv库
let priKey = BSV.PrivateKey.fromRandom() //随机生成私钥
console.log(priKey.toHex()) //输出Hex格式私钥
console.log(priKey.toAddress()) //输出地址