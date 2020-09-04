const {ipcMain, remote} = require('electron')
const {send: sendMainWindow} = require('./window/main')
const { create: createControlWindow, send: sendControlWindow} = require('./window/control')
const signal = require('./signal')

module.exports = function () {
    ipcMain.handle('login', async () => {

        let {code} =  await signal.invoke('login', null, 'logined')
        console.log('code', code)
        return code
    })

    ipcMain.on('control', async (e, remote) => {
        signal.send('control', {remote})
    })

    // 
    signal.on('controlled', async (data) => {
        console.log('receive controlled signal', data)
        createControlWindow()
        sendMainWindow('control-state-change', data.remote, 1)
    })

    signal.on('be-controlled', (data) => {
        console.log('receive be-controlled signal', data)
        sendMainWindow('control-state-change', data.remote, 2)
    })

    // puppet、control共享的信道，就是转发
    ipcMain.on('forward',  (e, event, data) => {
        signal.send('forward', {event, data})
    })

    signal.on('offer', (data) => {
        sendMainWindow('offer', data)
    })

    signal.on('answer', (data) => {
        sendControlWindow('answer', data)
    })

    // 收到control证书，puppet响应
    signal.on('puppet-candidate', (data) => {
        sendControlWindow('condidate', data)
    })

    // 收到puppet证书，control响应
    signal.on('control-candidate', (data) => {
        sendMainWindow('condidate', data)
    })
}