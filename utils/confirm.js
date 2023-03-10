import { Dialog } from 'quasar'

/**
 * 确认框
 */
export default function confirm(options) {
    return Dialog.create(Object.assign({
        title: '提示',
        cancel: true,
    }, options))
}
