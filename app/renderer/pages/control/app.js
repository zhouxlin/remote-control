const peer = require('./peer-control')

let video = document.getElementById('screen-video')

function play(stream) {
    video.srcObject = stream

    video.onloadedmetadata = function () {
        video.play()
    }
}

// 监听事件
peer.on('add-stream', (stream) => {
    console.log('play stream', stream)
    play(stream)
})

// 键盘事件
window.onkeydown = function (e) {
    var data = {
        keyCode: e.keyCode,
        shift: e.shiftKey,
        meta: e.metaKey,
        control: e.ctrlKey,
        alt: e.altKey
    }
    peer.emit('robot', 'key', data)
}

// 鼠标点击事件
window.onmouseup = function (e) {
    let data = {}
    data.clientX = e.clientX
    data.clientY = e.clientY
    data.video = {
        width: video.getBoundingClientRect().width,
        height: video.getBoundingClientRect().height,
    }

    peer.emit('robot', 'mouse', data)
}