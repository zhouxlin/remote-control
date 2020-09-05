const EventEmitter = require('events')
const peer = new EventEmitter()
const{ipcRenderer} = require('electron')

// getScreenStream()
// peer.on('robot', function (type, data) {
//     if (type ==='mouse') {
//         data.screen = {
//             width: window.screen.width,
//             height: window.screen.height,
//         }
//     }
//     setTimeout(() => {
//         console.log(data)
//         ipcRenderer.send('robot', type, data)
//     }, 3000)

// })

// 创建连接
const pc = new window.RTCPeerConnection({})

// 创建消息通道
const dc = pc.createDataChannel('robotchannel', {reliable: false})
dc.onopen = function () {
    peer.on('robot', (type, data) => {
        dc.send(JSON.stringify({type, data}))
    })
}

dc.onmessage =  function(event) {
    console.log('messsage', event)
}

dc.onerror = (error) => {
    console.log('error', error)
}

// onicecandidate iceEvent
// addIceCandidate
pc.onicecandidate = function (e) { //
    console.log('candidate', JSON.stringify(e.candidate))
    if (e.candidate) {
        ipcRenderer.send('forward', 'control-candidate', e.candidate.toJSON())
    }
	// 告知其他人
}

// 需要发送candidate时触发，webRTC自动触发
ipcRenderer.on('candidate', (e, candidate) => {
    console.log('receive a candidate', candidate)
    addIceCandidate(candidate)
})

let candidates = [];
async function addIceCandidate(candidate) {
    if (candidate) {
        candidates.push(candidate)
    }
    if (pc.remoteDescription && pc.remoteDescription.type) {
        for (let i = 0; i < candidates.length; i++) {
            await pc.addIceCandidate(new RTCIceCandidate(candidates[i]))
        }
        candidates = []
    } else {
        console.log('peer connection remoteDescription is not set', pc.remoteDescription)
    }
}
// window.addIceCandidate = addIceCandidate

async function createOffer(){
    const offer = await pc.createOffer({
        offerToReceiveAudio: false,
        offerToReceiveVideo: true
    })
    await pc.setLocalDescription(offer)
    console.log('control create offer success：', JSON.stringify(pc.localDescription))
    return pc.localDescription
}

createOffer().then((offer) => {
    ipcRenderer.send('forward', 'offer', {type: offer.type, sdp: offer.sdp})
})

async function setRemote(answer) {
    await pc.setRemoteDescription(answer)
}

ipcRenderer.on('answer', (e, answer) => {
    setRemote(answer)
    console.log('set remote success(control)')
})

// window.setRemote = setRemote
// 监听addtracks
pc.ontrack = function (e) {
    if (e.streams && e.streams[0]) {
        peer.emit('add-stream', e.streams[0])
    } else {
        let inboundStream = new MediaStream(e.track);
        peer.emit('add-stream', inboundStream)
    }
}

module.exports = peer