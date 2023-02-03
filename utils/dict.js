import dictData from '@/configs/dict.json'

/**
 * 数据字典
 */

// 设置字典数据
$n.dictData = dictData

/**
 * 获取字典值对应的文字
 */
$n.dict = function(key, value, defaultValue = '') {
    if (
        key
        && $n.has(dictData, key)
    ) {
        for (const item of dictData[key]) {
            if (item[1] === value) {
                return item[0]
            }
        }
    }

    return defaultValue
}

$n.dictOptions = function(key, textKey = 'label', valueKey = 'value') {

    const lists = []

    const dictItem = $n.get(dictData, key, [])

    for (const item of dictItem) {

        const val = {}
        val[textKey] = item[0]
        val[valueKey] = item[1]

        lists.push(val)
    }

    return lists
}
