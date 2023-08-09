import { Platform, Screen, Dialog } from 'quasar'

import $n_getFile from './getFile'

/**
 * 播放视频 / 音频
 */
export default function play(hash) {

    const src = $n_getFile(hash)

    let width
    let height
    let fullWidth = false
    let fullHeight = false
    let ok = true
    let style = ''

    if (Platform.is.mobile) {
        width = Screen.width - 48 - 32
        height = Screen.height - 48 - 32 - 6 - 52
        fullWidth = true
        fullHeight = true
    } else {
        width = 800 - 32
        height = 400 - 32 - 6
        ok = false
        style = 'width:800px;max-width:800px;height:400px;max-height:400px;'
    }

    Dialog.create({
        message: `<video style="width:${width}px;height:${height}px;" playsinline autoplay controls src="${src}" type="video/mp4" muted="muted"></video>`,
        style,
        html: true,
        dark: true,
        ok,
        fullWidth,
        fullHeight,
    })
}
