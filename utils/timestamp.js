import { stateTimeDiff } from '../store'

/**
 * 获取当前时间戳
 */
export default function timestamp(isMicro = false) {

    // 获取当前时间戳(毫秒)
    const nowTime = new Date().getTime()

    // 如果是毫秒
    if (isMicro) {
        return nowTime - (stateTimeDiff.value * 1000)
    }

    // 否则是秒
    return Math.floor(nowTime / 1000) - stateTimeDiff.value
}
