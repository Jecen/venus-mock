import io from 'socket.io-client'
import uuid from 'uuid/v1'

class Socket {
  // path: string
  // namespace: string
  // client: any
  // io: any
  // listenerMap: Object

  constructor(path, namespace) {
    this.path = path
    this.namespace = namespace
    this.listenerMap = {}
  }

  connect() {
    this.io = io(`${this.path}/${this.namespace}`, {
      autoConnect: true,
    })
    this.io.on('connection', () => {
      this.updateListener()
    })
  }

  updateListener() {
    Object.keys(this.listenerMap).forEach(eventType => {
      this.io && this.io.on(eventType, (data) => {
        this.listenerMap[eventType].forEach(itm => itm.func(data))
      })
    })
  }

  registerListener(type, func) {
    const id = uuid()
    if (this.listenerMap.hasOwnProperty(type)) {
      this.listenerMap[type].push({ id, func })
    } else {
      this.listenerMap[type] = [{ id, func }]
    }
    this.updateListener()
    return id
  }

  unRegisterListener(id) {
    let targetType = ''
    let targetIndex = -1
    Object.keys(this.listenerMap).forEach(key => {
      this.listenerMap[key].forEach((listener, index) => {
        if (listener.id === id) {
          targetType = key
          targetIndex = index
        }
      })
    })
    if (targetType) {
      this.listenerMap[targetType].splice(targetIndex, 1)
      this.updateListener()
      return true
    } else {
      console.error('无对应id的监听函数')
      return false
    }
  }
}

export default (Vue, { path, namespace }) => {
  Vue.prototype[`$${namespace}Socket`] = new Socket(path, namespace)
}