import * as IO from 'koa-socket';
import log from './log';

const styles = {
  bold          : ['\x1B[1m',  '\x1B[22m'],
  italic        : ['\x1B[3m',  '\x1B[23m'],
  underline     : ['\x1B[4m',  '\x1B[24m'],
  inverse       : ['\x1B[7m',  '\x1B[27m'],
  strikethrough : ['\x1B[9m',  '\x1B[29m'],
  white         : ['\x1B[37m', '\x1B[39m'],
  grey          : ['\x1B[90m', '\x1B[39m'],
  black         : ['\x1B[30m', '\x1B[39m'],
  blue          : ['\x1B[34m', '\x1B[39m'],
  cyan          : ['\x1B[36m', '\x1B[39m'],
  green         : ['\x1B[32m', '\x1B[39m'],
  magenta       : ['\x1B[35m', '\x1B[39m'],
  red           : ['\x1B[31m', '\x1B[39m'],
  yellow        : ['\x1B[33m', '\x1B[39m'],
  whiteBG       : ['\x1B[47m', '\x1B[49m'],
  greyBG        : ['\x1B[49;5;8m', '\x1B[49m'],
  blackBG       : ['\x1B[40m', '\x1B[49m'],
  blueBG        : ['\x1B[44m', '\x1B[49m'],
  cyanBG        : ['\x1B[46m', '\x1B[49m'],
  greenBG       : ['\x1B[42m', '\x1B[49m'],
  magentaBG     : ['\x1B[45m', '\x1B[49m'],
  redBG         : ['\x1B[41m', '\x1B[49m'],
  yellowBG      : ['\x1B[43m', '\x1B[49m'],
};

// import * as co from 'co'
class SocketIo {
  io: any;
  socket: any;
  namespace: string;
  isConnect: boolean;
  register: object;

  constructor (app, namespace, callback = null) {
    const io = new IO({
      namespace,
    });
    io.attach(app);
    this.io = io;
    this.register = {};

    io.on('connection', ({ socket }) => {
      console.log(
        styles.bold.join(styles.magenta.join('[io]')),
        styles.inverse.join(' --> connection'),
      );
      this.isConnect = true;
      this.socket = socket;
      this.register = {};
      callback && callback(this);
    });

    return this;
  }

  public sendMsg(type, data) {
    if (this.isConnect) {
      this.socket.emit(type, JSON.stringify(data));
    }
  }

  public registerReceive(type: string, receive: Function) {
    if (this.register.hasOwnProperty(type)) {
      this.register[type].push(receive);
    } else {
      this.register[type] = [receive];
      this.rebindReceive();
    }
  }

  public clearRegister () {
    this.register = {};
  }

  private rebindReceive () {
    if (!this.socket) {
      log.sysError('socket not connect');
    } else {
      Object.keys(this.register).forEach((type) => {
        delete this.socket._events[type];
        this.socket.on(type, (data) => {
          const payload = JSON.parse(data);
          this.register[type].forEach((receive) => {
            receive(payload);
          });
        });
      });
    }
  }

}

export default SocketIo;
