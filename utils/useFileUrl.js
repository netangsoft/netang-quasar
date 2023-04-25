import $n_isFunction from 'lodash/isFunction'

import $n_isValidString from '@netang/utils/isValidString'
import $n_slash from '@netang/utils/slash'

import { configs } from './config'

/**
 * 获取文件 url
 */
export default function useFileUrl(domain, src) {

    // 获取文件地址
    const {
        getFileUrl,
    } = configs
    if ($n_isFunction(getFileUrl)) {
        const res = getFileUrl(domain, src)
        if ($n_isValidString(res)) {
            return res
        }
    }

    return $n_slash(domain, 'end', true) + src
}
