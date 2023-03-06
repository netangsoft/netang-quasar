import $n_has from 'lodash/has'
import $n_cloneDeep from 'lodash/cloneDeep'
import $n_merge from 'lodash/merge'
import $n_isFunction from 'lodash/isFunction'
import $n_findIndex from 'lodash/findIndex'

import $n_forEach from '@netang/utils/forEach'
import $n_isValidArray from '@netang/utils/isValidArray'
import $n_join from '@netang/utils/join'
import $n_split from '@netang/utils/split'
import $n_indexOf from '@netang/utils/indexOf'

import $n_isRequired from '@netang/utils/isRequired'
import $n_forIn from '@netang/utils/forIn'
import $n_runAsync from '@netang/utils/runAsync'
import $n_isValidObject from '@netang/utils/isValidObject'
import $n_isValidValue from '@netang/utils/isValidValue'
import $n_trimString from '@netang/utils/trimString'
import $n_numberDeep from '@netang/utils/numberDeep'
import $n_toDate from '@netang/utils/toDate'

import { date as quasarDate } from 'quasar'
import { getQuickRange, quickRange } from '../components/field-date/methods'

import $n_dictOptions from './dictOptions'
import { configs } from './config'

const {
    // 字典常量
    dicts,
} = configs

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
        $n_forEach(quickRange, function(label, key) {
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
        $n_has(item, 'compare')
        && $n_isValidArray(item.compare)
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
    if ($n_findIndex(opts1, { value: dicts.SEARCH_COMPARE_TYPE__GT }) > -1) {
        item.compareOptions2.push({ label: '<', value: dicts.SEARCH_COMPARE_TYPE__LT })

    // 如果比较类型有 >=
    } else if ($n_findIndex(opts1, { value: dicts.SEARCH_COMPARE_TYPE__GTE }) > -1) {
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
        value[0].value = $n_join(val, ',')

    // 如果值是逗号隔开
    } else if ($n_split(val, ',').length > 1) {
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
    if ($n_findIndex(compareOptions1, { value: value1.compare }) === -1) {
        // 则取比较条件中的第一个
        value1.compare = compareOptions1[0].value
    }

    // 如果比较类型不为 in / not in
    if ($n_indexOf([ dicts.SEARCH_COMPARE_TYPE__IN, dicts.SEARCH_COMPARE_TYPE__NOT_IN ], value1.compare) === -1) {
        // 如果值中含有逗号
        const arr = $n_split(value1.value, ',')
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
export function getRawData(tableColumns, query, searchFromQuery = true) {

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

    $n_forEach(tableColumns, function (item) {
        if ($n_has(item, 'search.type')) {

            // 【设置原始表格搜索参数】
            // --------------------------------------------------

            // 搜索参数
            const newItem = $n_merge({
                // 标签
                label: item.label,
            }, item.search)

            // 标识
            newItem.name = $n_has(newItem, 'name') ? newItem.name : item.name

            // 如果有字典标识
            if ($n_has(item, 'dict')) {
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
            rawTableSearchValue.push($n_cloneDeep(value))

            if (
                // 如果开启从参数中获取搜索值
                searchFromQuery
                // 如果在传参中有搜索参数
                && $n_has(query, newItem.name)
            ) {
                // 如果有值
                if ($n_isRequired(query[newItem.name])) {
                    // 设置单个搜索值
                    setItemValue(value, query[newItem.name])
                }

                // 设置参数中搜索的 key
                searchQueryKey.push(newItem.name)

            // 否则, 如果表格参数中有设置初始值
            } else if (
                $n_has(newItem, 'value')
                && $n_isValidArray(newItem.value)
            ) {
                value = $n_merge([], value, newItem.value)
            }

            // 格式化单个值的比较条件
            formatItemValueCompare(value, newItem)

            // 首次初始表格搜索值
            firstTableSearchValue.push(value)
        }
    })

    if (searchQueryKey.length) {
        $n_forIn(query, function(val, key) {
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
export async function getOptions(rawSearchOptions, format) {

    const lists = []

    if ($n_isValidArray(rawSearchOptions)) {
        for (const item of rawSearchOptions) {

            const newItem = Object.assign({}, item)

            // 格式化单个参数
            if ($n_isFunction(format)) {
                const res = await $n_runAsync(format)(newItem)
                if ($n_isValidObject(res)) {
                    $n_merge(newItem, res)
                }
            }

            // 如果有字典标识, 则一定是下拉菜单
            if ($n_has(newItem, 'dict')) {
                $n_merge(newItem, {
                    searchType: 'select',
                    select: {
                        options: $n_dictOptions(newItem.dict)
                    },
                })

            // 如果有下拉菜单选项
            } else if ($n_has(newItem, 'select')) {
                newItem.searchType = 'select'
                newItem.select = Object.assign({
                    options: [],
                }, newItem.select)

                // 如果下拉选项是方法
                if ($n_isFunction(newItem.select.options)) {
                    // 读取下拉选项
                    newItem.select.options = await $n_runAsync(newItem.select.options)()
                }

            // 如果有树选项(调用的是 <n-field-tree> 组件)
            } else if ($n_has(newItem, 'tree')) {
                newItem.searchType = 'tree'
                newItem.tree = Object.assign({
                    nodes: [],
                    accordion: true,
                    clearable: true,
                }, newItem.tree)

            // 如果有表格选项(调用的是 <n-field-table.md> 组件)
            } else if ($n_has(newItem, 'table')) {
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
export function formatValue(rawSearchOptions, searchValue) {

    const lists = []

    $n_forEach(rawSearchOptions, function ({ name, type }, itemIndex) {

        // 添加值1
        function addValue1(value1) {

            // 如果有值1
            if ($n_isValidValue(value1.value)) {

                // 如果值1 类型为 in / not in
                if ($n_indexOf([dicts.SEARCH_COMPARE_TYPE__IN, dicts.SEARCH_COMPARE_TYPE__NOT_IN], value1.compare) > -1) {
                    const vals = []
                    $n_forEach($n_split($n_trimString(value1.value).replaceAll('，', ','), ','), function (item) {
                        item = $n_numberDeep(item)
                        if ($n_isValidValue(item)) {
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
                    value: $n_numberDeep(value1.value),
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
                            value: $n_numberDeep(quasarDate.formatDate($n_toDate(`${res.date.from} ${res.time.from}`), 'X')),
                        },
                        // 日期止
                        {
                            field: name,
                            // ≤
                            compare: dicts.SEARCH_COMPARE_TYPE__LTE,
                            value: $n_numberDeep(quasarDate.formatDate($n_toDate(`${res.date.to} ${res.time.to}`), 'X')),
                        }
                    )
                }
                return
            }

            // 添加值1
            addValue1(value1)

            // 只有值1 类型为 > / ≥ 值2才有效
            if ($n_indexOf([dicts.SEARCH_COMPARE_TYPE__GT, dicts.SEARCH_COMPARE_TYPE__GTE], value1.compare) > -1) {
                const value2 = searchValue[itemIndex][1]
                if ($n_isValidValue(value2.value)) {
                    lists.push({
                        field: name,
                        compare: value2.compare,
                        value: $n_numberDeep(value2.value),
                    })
                }
            }
        }
    })

    return lists
}
