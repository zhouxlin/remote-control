const {app} = require('electron')
const path = require('path')
const handleIPC = require('./ipc')
const {create: createMainWindow, show: showMainWindow} = require('./window/main')

// 新版本不允许在renderer中使用native modoule，将这个设为false 才允许
// app.allowRendererProcessReuse = false;
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
    app.quit()
} else {
    app.on('second-instance', () => {
        showMainWindow()
    })
    app.on('ready', () => {
        createMainWindow()
        // createControlWindow()
        handleIPC()
        require('./robot')()
    })
}
