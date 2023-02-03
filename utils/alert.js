import { Dialog } from 'quasar'

/**
 * 提示框
 */
$n.alert = function(params) {
    return Dialog.create(Object.assign({
        title: '提示',
    }, params))
}
