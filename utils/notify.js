import { Notify } from 'quasar'

/**
 * 通知
 */
export default function notify(params) {
    Notify.create(Object.assign({
        // 出现位置
        position: 'bottom-right',
        // 显示时间
        timeout: 1500,
    }, params))
}
