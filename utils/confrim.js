import { Dialog } from 'quasar'

/**
 * 确认框
 */
$n.confirm = function(params) {
    return Dialog.create(Object.assign({
        title: '提示',
        cancel: true,
    }, params))
}
