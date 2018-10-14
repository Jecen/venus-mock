import * as path from 'path'
import * as fs from 'fs-extra'

const sqlite3 = require('sqlite3').verbose()

class DB {
  db: any

  constructor () {
    const dbPath = path.join(__dirname, '../../db')
    const dbFiletName = 'venus-mock.db'

    fs.ensureDir(dbPath)

    this.db = new sqlite3.Database(path.join(dbPath, dbFiletName));

    return this.db
  }
}

export default DB