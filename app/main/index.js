const {app} = require('electron')
const path = require('path')
const handleIPC = require('./ipc')

// 新版本不允许在renderer中使用native modoule，将这个设为false 才允许
// app.allowRendererProcessReuse = false;
const {create: createMainWindow} = require('./window/main')
// const { create: createControlWindow } = require('./window/control')
app.on('ready', () => {
    createMainWindow()
    // createControlWindow()
    handleIPC()
    require('./robot')()
})