import { Dialog } from 'quasar'

/**
 * 提示框
 */
function alert(params) {
    return Dialog.create(Object.assign({
        title: '提示',
    }, params))
}

export default alert
