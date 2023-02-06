import $n_copy from '@netang/utils/copy'

import $n_toast from './toast'

/**
 * 复制
 */
export default function copy(text, message) {
    if (message) {
        // 轻提示
        $n_toast({
            type: 'positive',
            message,
        })
    }
    // 复制
    $n_copy(text)
}
