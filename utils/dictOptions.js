import $n_get from 'lodash/get'

import { configs } from './config'

/**
 * 数据字典选项数组
 * @param {String} key 字典键值
 * @param {String} labelKey 标签键值
 * @param {String} valueKey 值键值
 * @returns {Array}
 */
export default function dictOptions(key, labelKey = 'label', valueKey = 'value') {

    const lists = []

    const dictItem = $n_get(configs.userDict, key, [])

    for (const item of dictItem) {

        const val = {}
        val[labelKey] = item[0]
        val[valueKey] = item[1]

        lists.push(val)
    }

    return lists
}
