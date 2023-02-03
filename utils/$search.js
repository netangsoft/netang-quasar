import { date as quasarDate } from 'quasar'
import { getQuickRange, quickRange } from '../components/field-date/methods'

/**
 * 比较类型默认值
 */
const COMPARE_TYPE_MAPS = {
    // 数字
    number: dicts.SEARCH_COMPARE_TYPE__EQUAL,
    // 文字
    text: dicts.SEARCH_COMPARE_TYPE__LIKE,
    // 价格
    price: dicts.SEARCH_COMPARE_TYPE__EQUAL,
    // 日期
    date: dicts.SEARCH_COMPARE_TYPE__EQUAL,
}

/**
 * 设置单个比较条件
 */
function setItemCompare(item) {

    // 初始比较条件数组
    let opts1 = item.type === 'text'
        // 如果类型为 文字
        ? [
            { label: '相同', value: dicts.SEARCH_COMPARE_TYPE__EQUAL },
            { label: '不同', value: dicts.SEARCH_COMPARE_TYPE__NOT_EQUAL },
            { label: '包含', value: dicts.SEARCH_COMPARE_TYPE__LIKE },
            { label: '不含', value: dicts.SEARCH_COMPARE_TYPE__NOT_LIKE },
        ]
        // 否则为数字
        : [
            { label: '=', value: dicts.SEARCH_COMPARE_TYPE__EQUAL },
            { label: '!=', value: dicts.SEARCH_COMPARE_TYPE__NOT_EQUAL },
            { label: '>', value: dicts.SEARCH_COMPARE_TYPE__GT },
            { label: '≥', value: dicts.SEARCH_COMPARE_TYPE__GTE },
        ]

    // 如果类型为日期
    if (item.type === 'date') {
        // 添加日期快捷选项
        $n.forEach(quickRange, function(label, key) {
            opts1.push({ label, value: key + 20 })
        })

    // 否则为其他
    } else {
        opts1.push(
            { label: 'IN', value: dicts.SEARCH_COMPARE_TYPE__IN },
            { label: 'NOT IN', value: dicts.SEARCH_COMPARE_TYPE__NOT_IN },
        )
    }

    // 如果有比较类型
    if (
        $n.has(item, 'compare')
        && $n.isValidArray(item.compare)
    ) {
        const {
            compare,
            compareIgnore
        } = item

        // 如果有筛选比较条件
        // 筛选比较条件
        opts1 = opts1.filter(
            compareIgnore === true
                // 如果为忽略比较条件
                ? e => compare.indexOf(e.value) === -1
                // 否则为限制比较条件
                : e => compare.indexOf(e.value) > -1
        )
    }

    // 如果没有比较选项, 则设置相同为默认
    if (! opts1.length) {
        opts1.push({ label: type === 'text' ? '相同' : '=', value: dicts.SEARCH_COMPARE_TYPE__EQUAL })
    }

    // 值1 比较类型条件
    item.compareOptions1 = opts1
    // 值2 比较类型条件
    item.compareOptions2 = []

    // 如果比较类型有 >
    if ($n.findIndex(opts1, { value: dicts.SEARCH_COMPARE_TYPE__GT }) > -1) {
        item.compareOptions2.push({ label: '<', value: dicts.SEARCH_COMPARE_TYPE__LT })

    // 如果比较类型有 >=
    } else if ($n.findIndex(opts1, { value: dicts.SEARCH_COMPARE_TYPE__GTE }) > -1) {
        item.compareOptions2.push({ label: '≤', value: dicts.SEARCH_COMPARE_TYPE__LTE })
    }
}

/**
 * 设置单个搜索值
 */
export function setItemValue(value, val) {

    // 如果值为数组
    if (Array.isArray(val)) {
        // 比较类型为 in
        value[0].compare = dicts.SEARCH_COMPARE_TYPE__IN
        // 设置值为将数组转为逗号分隔的字符串
        value[0].value = $n.join(val, ',')

    // 如果值是逗号隔开
    } else if ($n.split(val, ',').length > 1) {
        // 比较类型为 in
        value[0].compare = dicts.SEARCH_COMPARE_TYPE__IN
        // 设置值为将数组转为逗号分隔的字符串
        value[0].value = val

    // 否则为单个值
    } else {
        // 比较类型为 ==
        value[0].compare = dicts.SEARCH_COMPARE_TYPE__EQUAL
        // 设置值为当前值
        value[0].value = val
    }
}

/**
 * 格式化单个比较条件
 */
function formatItemValueCompare(value, { compareOptions1 }) {

    // 获取第一个值
    const value1 = value[0]

    // 如果值1 的比较条件不在值1 的限制范围内
    if ($n.findIndex(compareOptions1, { value: value1.compare }) === -1) {
        // 则取比较条件中的第一个
        value1.compare = compareOptions1[0].value
    }

    // 如果比较类型不为 in / not in
    if ($n.indexOf([ dicts.SEARCH_COMPARE_TYPE__IN, dicts.SEARCH_COMPARE_TYPE__NOT_IN ], value1.compare) === -1) {
        // 如果值中含有逗号
        const arr = $n.split(value1.value, ',')
        if (arr.length > 1) {
            value1.value = arr[0]
        }
    }

    // 如果值1 比较类型为 >
    if (value1.compare === dicts.SEARCH_COMPARE_TYPE__GT) {
        // 则修改值2 类型为 <
        value[1].compare = dicts.SEARCH_COMPARE_TYPE__LT

    // 如果值1 比较类型为 >=
    } else if (value1.compare === dicts.SEARCH_COMPARE_TYPE__GTE) {
        // 则修改值2 类型为 <=
        value[1].compare = dicts.SEARCH_COMPARE_TYPE__LTE
    }
}

/**
 * 从表格列获取原始值
 */
function getRawData(tableColumns, query, searchFromQuery = true) {

    // 原始参数
    const rawQuery = {}
    // 原始表格搜索参数
    const rawSearchOptions = []
    // 原始表格搜索值(空表格搜索值, 用于搜索重置)
    const rawTableSearchValue = []
    // 首次表格搜索值(如果表格搜索参数中带了初始值, 则设置初始值)
    const firstTableSearchValue = []

    // 搜索参数键值数组
    const searchQueryKey = []

    $n.forEach(tableColumns, function (item) {
        if ($n.has(item, 'search.type')) {

            // 【设置原始表格搜索参数】
            // --------------------------------------------------

            // 搜索参数
            const newItem = $n.merge({
                // 标签
                label: item.label,
            }, item.search)

            // 标识
            newItem.name = $n.has(newItem, 'name') ? newItem.name : item.name

            // 如果有字典标识
            if ($n.has(item, 'dict')) {
                newItem.dict = item.dict
            }

            // 设置单个比较条件
            setItemCompare(newItem)

            // 原始表格搜索参数
            rawSearchOptions.push(newItem)

            // 【原始表格搜索值】
            // --------------------------------------------------

            let value = [
                // 值1
                {
                    // 比较类型
                    compare: COMPARE_TYPE_MAPS[newItem.type],
                    // 值
                    value: '',
                },
                // 值2
                {
                    // 比较类型
                    compare: dicts.SEARCH_COMPARE_TYPE__LT,
                    // 值
                    value: '',
                },
            ]

            // 如果是日期
            if (newItem.type === 'date') {
                // 设置日期类型
                value[0].dateType = 'day'
            }

            // 添加原始表格搜索值
            rawTableSearchValue.push($n.cloneDeep(value))

            if (
                // 如果开启从参数中获取搜索值
                searchFromQuery
                // 如果在传参中有搜索参数
                && $n.has(query, newItem.name)
            ) {
                // 如果有值
                if ($n.isRequired(query[newItem.name])) {
                    // 设置单个搜索值
                    setItemValue(value, query[newItem.name])
                }

                // 设置参数中搜索的 key
                searchQueryKey.push(newItem.name)

            // 否则, 如果表格参数中有设置初始值
            } else if (
                $n.has(newItem, 'value')
                && $n.isValidArray(newItem.value)
            ) {
                value = $n.merge([], value, newItem.value)
            }

            // 格式化单个值的比较条件
            formatItemValueCompare(value, newItem)

            // 首次初始表格搜索值
            firstTableSearchValue.push(value)
        }
    })

    if (searchQueryKey.length) {
        $n.forIn(query, function(val, key) {
            if (searchQueryKey.indexOf(key) === -1) {
                rawQuery[key] = val
            }
        })
    } else {
        Object.assign(rawQuery, query)
    }

    return {
        // 原始参数
        rawQuery,
        // 原始表格搜索参数
        rawSearchOptions,
        // 原始表格搜索值(空表格搜索值, 用于搜索重置)
        rawTableSearchValue,
        // 首次表格搜索值(如果表格搜索参数中带了初始值, 则设置初始值)
        firstTableSearchValue,
    }
}

/**
 * 获取参数
 */
async function getOptions(rawSearchOptions, format) {

    const lists = []

    if ($n.isValidArray(rawSearchOptions)) {
        for (const item of rawSearchOptions) {

            const newItem = Object.assign({}, item)

            // 格式化单个参数
            if ($n.isFunction(format)) {
                const res = await $n.runAsync(format)(newItem)
                if ($n.isValidObject(res)) {
                    $n.merge(newItem, res)
                }
            }

            // 如果有字典标识, 则一定是下拉菜单
            if ($n.has(newItem, 'dict')) {
                $n.merge(newItem, {
                    searchType: 'select',
                    select: {
                        options: $n.dictOptions(newItem.dict)
                    },
                })

            // 如果有下拉菜单选项
            } else if ($n.has(newItem, 'select')) {
                newItem.searchType = 'select'
                newItem.select = Object.assign({
                    options: [],
                }, newItem.select)

                // 如果下拉选项是方法
                if ($n.isFunction(newItem.select.options)) {
                    // 读取下拉选项
                    newItem.select.options = await $n.runAsync(newItem.select.options)()
                }

            // 如果有树选项(调用的是 <n-field-tree> 组件)
            } else if ($n.has(newItem, 'tree')) {
                newItem.searchType = 'tree'
                newItem.tree = Object.assign({
                    nodes: [],
                    accordion: true,
                    clearable: true,
                }, newItem.tree)

                // 如果节点数组是方法
                if ($n.isFunction(newItem.tree.nodes)) {
                    // 读取下拉选项
                    newItem.tree.nodes = await $n.runAsync(newItem.tree.nodes)()
                }

            // 如果有表格选项(调用的是 <n-field-table> 组件)
            } else if ($n.has(newItem, 'table')) {
                newItem.searchType = 'table'
                newItem.table = Object.assign({
                    // 值字段(必填)
                    valueKey: newItem.name,
                    // 是否可清除
                    clearable: true,
                    // 是否开启筛选
                    filter: true,
                }, newItem.table)

            // 否则为输入框
            } else {
                newItem.searchType = 'input'
                newItem.input = Object.assign({}, newItem.input)
            }

            lists.push(newItem)
        }
    }

    return lists
}

/**
 * 格式化值
 */
function formatValue(rawSearchOptions, searchValue) {

    const lists = []

    $n.forEach(rawSearchOptions, function ({ name, type }, itemIndex) {

        // 添加值1
        function addValue1(value1) {

            // 如果有值1
            if ($n.isValidValue(value1.value)) {

                // 如果值1 类型为 in / not in
                if ($n.indexOf([dicts.SEARCH_COMPARE_TYPE__IN, dicts.SEARCH_COMPARE_TYPE__NOT_IN], value1.compare) > -1) {
                    const vals = []
                    $n.forEach($n.split($n.trimString(value1.value).replaceAll('，', ','), ','), function (item) {
                        item = $n.numberDeep(item)
                        if ($n.isValidValue(item)) {
                            vals.push(item)
                        }
                    })
                    if (vals.length) {
                        lists.push({
                            field: name,
                            compare: value1.compare,
                            value: vals,
                        })
                    }
                    return
                }

                // 否则添加值1
                lists.push({
                    field: name,
                    compare: value1.compare,
                    value: $n.numberDeep(value1.value),
                })
            }
        }

         // 第一个值
         const value1 = searchValue[itemIndex][0]

        // 如果是文字
        if (type === 'text') {
            // 添加值1
            addValue1(value1)

        // 否则为数字
        } else {

            if (
                // 如果是日期
                type === 'date'
                // 如果类型为快捷日期
                && value1.compare >= 20
            ) {
                const res = getQuickRange(value1.compare - 20, true)
                if (res) {

                    lists.push(
                        // 日期起
                        {
                            field: name,
                            // ≥
                            compare: dicts.SEARCH_COMPARE_TYPE__GTE,
                            value: $n.numberDeep(quasarDate.formatDate($n.toDate(`${res.date.from} ${res.time.from}`), 'X')),
                        },
                        // 日期止
                        {
                            field: name,
                            // ≤
                            compare: dicts.SEARCH_COMPARE_TYPE__LTE,
                            value: $n.numberDeep(quasarDate.formatDate($n.toDate(`${res.date.to} ${res.time.to}`), 'X')),
                        }
                    )
                }
                return
            }

            // 添加值1
            addValue1(value1)

            // 只有值1 类型为 > / ≥ 值2才有效
            if ($n.indexOf([dicts.SEARCH_COMPARE_TYPE__GT, dicts.SEARCH_COMPARE_TYPE__GTE], value1.compare) > -1) {
                const value2 = searchValue[itemIndex][1]
                if ($n.isValidValue(value2.value)) {
                    lists.push({
                        field: name,
                        compare: value2.compare,
                        value: $n.numberDeep(value2.value),
                    })
                }
            }
        }
    })

    return lists
}

/**
 * 搜素业务
 */
$n.$search = {
    // 获取原始值
    getRawData,
    // 获取参数
    getOptions,
    // 格式化值
    formatValue,
}
