import { Dialog } from 'quasar'

/**
 * 提示框
 */
utils.alert = function(params) {
    return Dialog.create(Object.assign({
        title: '提示',
    }, params))
}
