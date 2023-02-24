import { Dialog } from 'quasar'

/**
 * 提示框
 */
function alert(options) {
    return Dialog.create(Object.assign({
        title: '提示',
    }, options))
}

export default alert
