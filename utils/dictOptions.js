import $n_get from 'lodash/get'

import { configs } from './config'

/**
 * 数据字典选项
 */
export default function dictOptions(key, textKey = 'label', valueKey = 'value') {

    const lists = []

    const dictItem = $n_get(configs.userDict, key, [])

    for (const item of dictItem) {

        const val = {}
        val[textKey] = item[0]
        val[valueKey] = item[1]

        lists.push(val)
    }

    return lists
}
