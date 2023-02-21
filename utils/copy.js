import { copyToClipboard } from 'quasar'

import $n_toast from './toast'

/**
 * 复制
 */
export default function copy(text, message) {

    // 提示
    if (message) {

        if (message === true) {
            message = `复制【${text}】成功`
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
