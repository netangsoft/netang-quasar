import $n_isValidArray from '@netang/utils/isValidArray'
import $n_isValidString from '@netang/utils/isValidString'

import $n_uploader from './uploader'

import useFileUrl from './useFileUrl'

/**
 * 获取文件
 */
export default function getFile(src) {

    if (src) {

        // 如果为数组, 则获取第一个
        if ($n_isValidArray(src)) {
            src = src[0]
        }

        if ($n_isValidString(src)) {

            // http(s):// 或 data: 或 blob: 开头的地址
            if (/^(http(s)?:\/\/|data:|blob:)/i.test(src)) {
                return src
            }

            const {
                type,
                domain,
            } = $n_uploader.getUpload()

            switch (type) {
                // 七牛云
                case 'qiniu':
                // minio
                case 'minio':
                    return useFileUrl(domain, src)
            }
        }
    }

    return ''
}
