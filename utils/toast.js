import { Notify, Platform } from 'quasar'

/**
 * 轻提示
 */
utils.toast = function(params) {
    Notify.create(Object.assign({
        // 出现位置
        position: Platform.is.desktop ? 'top' : 'bottom',
        // 显示时间
        timeout: 1000,
    }, params))
}
