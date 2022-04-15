// 处理业务逻辑的中间件,读取某个json文件的数据
const path = require('path')
const fileUtils = require('../utils/file_utils')
module.exports = async (ctx, next) => {
  // ctx是浏览器的上下文环境，ctx.request就是浏览器发送的请求，ctx.request.url就是我们输入在浏览器地址的路径
  //例如localhost:8888/api/seller
  // 我们实际项目中并不会采用在浏览器上输入地址的方式获取数据，而是会采用ajax的方式，这就会遇到跨域问题
  const url = ctx.request.url //  /api/seller   ../data/seller.json
  let filePath = url.replace('/api', '') //  /seller
  filePath = '../data' + filePath + '.json'  // ../data/seller.json
  filePath = path.join(__dirname, filePath)
  try {
    // 读取文件是异步操作，不能直接return，因此getFileJsonData方法返回的是一个promise对象,使用await解析得到data
    const ret = await fileUtils.getFileJsonData(filePath)
    // 设置响应体的内容
    ctx.response.body = ret
  } catch (error) {
    const errorMsg = {
      message: '读取文件内容失败, 文件资源不存在',
      status: 404
    }
    ctx.response.body = JSON.stringify(errorMsg)
  }
 
  console.log(filePath)
  // 最顶层中间件一般不需要next()方法，写上也没啥
  await next()
}
