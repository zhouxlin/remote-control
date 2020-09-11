const {BrowserWindow } = require('electron')
const isDev = require('electron-is-dev') 
const path =  require('path')

let win
function create() {
    win = new BrowserWindow({
        width: 600,
        height: 300,
        webPreferences: {
            nodeIntegration: true
        }
    })

    if (isDev) {
        win.loadURL("http://localhost:3000")
    } else {
        win.loadFile(path.resolve(__dirname, '../renderer/pages/main/index.html'))
    }
}

// 主进程向渲染进程发内容
function send(channel, ...args) {
    win.webContents.send(channel, ...args)
}
function show () {
    win.show()
}

module.exports = {create, send, show}
