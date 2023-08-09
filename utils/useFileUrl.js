import $n_isFunction from 'lodash/isFunction'

import $n_isValidString from '@netang/utils/isValidString'
import $n_slash from '@netang/utils/slash'

import { configs } from './config'

/**
 * 获取文件 url
 */
export default function useFileUrl(e) {

    // 获取文件地址
    const {
        getFileUrl,
    } = configs.uploader

    if ($n_isFunction(getFileUrl)) {
        const res = getFileUrl(e)
        if ($n_isValidString(res)) {
            return res
        }
    }

    return $n_slash(e.domain, 'end', true) + e.src
}
