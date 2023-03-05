import { copyToClipboard } from 'quasar'

import $n_toast from './toast'

/**
 * 复制
 */
export default function copy(text, message = null) {

    // 提示
    if (message !== false) {

        // 如果为 true, 则 message 设为 text
        if (message === true) {
            message = `复制【${text}】成功`
        } else if (! message) {
            message = '复制成功'
        }

        // 轻提示
        $n_toast({
            type: 'positive',
            message,
        })
    }

    // 复制
    copyToClipboard(text)
        .finally()
}
