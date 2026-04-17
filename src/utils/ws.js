import PubSub from 'pubsub-js'
import { Dialog } from "vant"

class Ws {
  // 要连接的URL
  url
  // 一个协议字符串或一个协议字符串数组。
  // 这些字符串用来指定子协议，这样一个服务器就可以实现多个WebSocket子协议
  protocols
  // WebSocket 实例
  ws
  // 是否在重连中
  isReconnectionLoading = false
  // 延时重连的 id
  timeId = null
  // 是否是用户手动关闭连接
  isCustomClose = false
  // 错误消息队列
  errorStack = []
  // 默认 MessageBox 未打开
  messageBoxFlag = 0

  constructor(url, protocols) {
    this.url = url
    this.protocols = protocols
    this.createWs()
  }

  createWs() {
    if ('WebSocket' in window) {
      // 实例化
      this.ws = new WebSocket(this.url, this.protocols)
      // 监听事件
      this.onopen()
      this.onerror()
      this.onclose()
      this.onmessage()
    } else {
      console.log('你的浏览器不支持 WebSocket')
    }
  }

  // 监听成功
  onopen() {
    this.ws.onopen = () => {
      console.log('onopen', new Date())
      // 发送成功连接之前所发送失败的消息
      this.errorStack.forEach(message => {
        this.send(message)
      })
      this.errorStack = []
      this.isReconnectionLoading = false
      PubSub.publish('CONNECT_SOCKET_SUCCESS')
    }
  }

  // 监听错误
  onerror() {
    this.ws.onerror = (err) => {
      console.log('onerror', new Date())
      this.reconnection()
      this.isReconnectionLoading = false
    }
  }

  // 监听关闭
  onclose() {
    this.ws.onclose = () => {
      console.log('onclose', new Date())

      // 用户手动关闭的不重连
      if (this.isCustomClose) return

      this.reconnection()
      this.isReconnectionLoading = false
    }
  }

  // 接收 WebSocket 消息
  async onmessage() {
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        PubSub.publish(data.commandType, data.data)
      } catch (error) {
        console.log('error', new Date())
      }
    }
  }

  // 重连
  reconnection() {
    // 防止重复
    if (this.isReconnectionLoading) return

    this.isReconnectionLoading = true
    clearTimeout(this.timeId)
    this.timeId = setTimeout(() => {
      this.createWs()
    }, 3000)
  }

  // 发送消息
  send(message) {
    // 连接失败时的处理
    if (this.ws && this.ws.readyState === 0) {
      this.errorStack.push(message)
    }
    //  else if (this.ws.readyState === 2) {
    //   if (this.messageBoxFlag === 0) {
    //     console.log('socket正在关闭, 请刷新页面重新连接')
    //     this.messageBoxFlag = 1
    //     return Dialog.alert({
    //         title: "提示",
    //         className: 'confirm-dialog',
    //         message: "网络异常，请刷新页面"
    //     }).then(() => {
    //       this.messageBoxFlag === 0
    //     }).catch(() => {
    //       this.messageBoxFlag === 0
    //     })
    //   }
    // } else if (this.ws.readyState === 3) {
    //   if (this.messageBoxFlag === 0) {
    //     console.log('socket已关闭, 请刷新页面重新连接')
    //     this.messageBoxFlag = 1
    //     return Dialog.alert({
    //         title: "提示",
    //         className: 'confirm-dialog',
    //         message: "网络异常，请刷新页面"
    //     }).then(() => {
    //       this.messageBoxFlag === 0
    //     }).catch(() => {
    //       this.messageBoxFlag === 0
    //     })
    //   }
    // } 
    else {
      this.ws.send(message)
    }
  }

  // 手动关闭
  close() {
    this.isCustomClose = true
    this.ws.close()
  }

  // 手动开启
  start() {
    this.isCustomClose = false
    this.reconnection()
  }

  // 销毁
  destroy() {
    this.close()
    this.ws = null
    this.errorStack = null
  }
}

export default Ws
