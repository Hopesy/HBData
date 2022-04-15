//node.js的path模块，通过path添加路径的方法
const path = require('path')
const fileUtils = require('../utils/file_utils')
const WebSocket = require('ws')
// 创建WebSocket服务端的对象, 绑定的端口号是9998
const wss = new WebSocket.Server({
  port: 9998
})
// 服务端开启了监听
module.exports.listen = () => {
  // 对客户端的连接事件进行监听
  // client:代表的是客户端的连接socket对象
  wss.on('connection', client => {
    console.log('有客户端连接成功了...')
    // 对客户端的连接对象进行message事件的监听
    // msg: 由客户端发给服务端的数据
    client.on('message',async msg => {
      console.log('客户端发送数据给服务端了: /n' + msg +'/n')
      // 将客户端发送过来的字符串数据转换成json对象
      let payload = JSON.parse(msg)
      const action = payload.action
      // 通过action的值来判断是哪个模块的消息
      if (action === 'getData') {
        let filePath = '../data/' + payload.chartName + '.json'
        // payload.chartName // trend seller map rank hot stock
        // 将文件路径转换成绝对路径
        filePath = path.join(__dirname, filePath)
        // 读取文件
        const ret = await fileUtils.getFileJsonData(filePath)
        // 需要在服务端获取到数据的基础之上, 增加一个data的字段
        // data所对应的值,就是某个图表数据的json文件的内容
        payload.data = ret
        client.send(JSON.stringify(payload))
      } else {
        //如果得到的action值不是getData, 那么就是全屏缩放或者改变主题，此时我们将数据发送给所有的客户端，实现联动效果
        // 原封不动的将所接收到的数据转发给每一个处于连接状态的客户端
        // wss.clients // 所有客户端的连接
        wss.clients.forEach(client => {
          client.send(msg)
        })
      }
      // 由服务端往客户端发送数据
      // client.send('hello socket from backend')
    })
  })
}
