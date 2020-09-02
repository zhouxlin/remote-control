const WebSocket = require('ws')
const wss = new WebSocket.Server({port: 8010})

const code2ws = new Map()

wss.on('connection', function connection(ws, request) {
    // wd => 端
    let code = Math.floor(Math.random() * (999999-100000)) + 100000
    code2ws.set(code, ws)

    ws.sendData = (event, data) => {
        ws.send(JSON.stringify({event, data}))
    }

    ws.sendError = msg => {
        ws.sendData('error', {msg})
    }

    ws.on('message', function incoming(message) {
        console.log('incoming', message)
        // {event, data}
        let parseMessage = {}

        try {
            parseMessage = JSON.parse(message)
        } catch (e) {
            ws.sendError('message invaild')
            console.log('parse message error')
            return
        }

        let {event, data} = parseMessage
        if (event === 'login') {
            ws.sendData('logined', {code})
        } else if (event === 'control') {
            console.log('control', data)
            let remote = +data.remote
            if (code2ws.has(remote)) {
                console.log('controll signal')
                ws.sendData('controlled', {remote})
                let remoteWS = code2ws.get(remote)
                ws.sendRemote = remoteWS.sendData
                remoteWS.sendRemote = ws.sendData
                ws.sendRemote('be-controlled', {remote: code})
            } else {
                ws.sendError('user not found')
            }
        } else if (event === "forward") {
            // data = {event, data}
            ws.sendRemote(data.event, data.data)
        } else {
            ws.sendError('message not handle', message)
        }
    })

    ws.on('close', () => {
        code2ws.delete(code)
        delete ws.sendRemote
        clearTimeout(ws._closeTimeout);
    })

    ws._closeTimeout = setTimeout(() => {
        ws.terminate();
    }, 600000);
})