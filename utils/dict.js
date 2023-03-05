import $n_has from 'lodash/has'

import { configs } from './config'

/**
 * 获取字典值对应的文字
 */
export default function dict(key, value, defaultValue = '') {
    if (
        key
        && $n_has(configs.userDict, key)
    ) {
        for (const item of configs.userDict[key]) {
            if (item[1] === value) {
                return item[0]
            }
        }
    }

    return defaultValue
}
