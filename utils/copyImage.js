import $n_copyImage from '@netang/utils/copyImage'

import $n_toast from './toast'

/**
 * 复制图片
 */
export default function copyImage(src) {

    $n_copyImage(src)
        .then(function () {
            // 轻提示
            $n_toast({
                type: 'positive',
                message: '复制图片成功',
            })
        })
        .catch(function (e) {
            // 轻提示
            $n_toast({
                type: 'negative',
                message: '复制图片失败：' + e,
            })
        })
}
