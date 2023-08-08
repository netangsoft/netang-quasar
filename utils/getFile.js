import $n_has from 'lodash/has'

import $n_isValidArray from '@netang/utils/isValidArray'
import $n_isValidObject from '@netang/utils/isValidObject'
import $n_isValidString from '@netang/utils/isValidString'
import $n_split from '@netang/utils/split'

import $n_uploader from './uploader'

import useFileUrl from './useFileUrl'

/**
 * 获取文件
 */
export default function getFile(src) {

    if (src) {

        // 如果是字符串
        if ($n_isValidString(src)) {

            // 则按照逗号隔开转为数租
            src = $n_split(src, ',')
        }

        // 如果为数组, 则获取第一个
        if ($n_isValidArray(src)) {
            src = src[0]
        }

        // 如果为对象
        if ($n_isValidObject(src)) {

            if ($n_has(src, 'img')) {
                src = src.img

            } else if ($n_has(src, 'file')) {
                src = src.file

            } else if ($n_has(src, 'video')) {
                src = src.video
            }
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

            return useFileUrl({ type, domain, src })
        }
    }

    return ''
}
