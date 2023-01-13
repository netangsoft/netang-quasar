import { date as quasarDate } from 'quasar'
import { getQuickRange } from '../components/field-date/methods'

/**
 * 比较类型默认值
 */
const COMPARE_TYPE_MAPS = {
    // 数字
    number: [dicts.SEARCH_TYPE__EQUAL, dicts.SEARCH_TYPE__LT],
    // 文字
    text: [dicts.SEARCH_TYPE__LIKE, dicts.SEARCH_TYPE__LT],
    // 价格
    price: [dicts.SEARCH_TYPE__EQUAL, dicts.SEARCH_TYPE__LT],
    // 日期
    date: [dicts.SEARCH_TYPE__GTE, dicts.SEARCH_TYPE__LTE],
}

/**
 * 从表格列获取原始值
 */
function getRawData(tableColumns) {

    // 原始表格搜索值
    const rawTableSearchValue = []
    // 原始表格搜索参数
    const rawSearchOptions = []

    utils.forEach(tableColumns, function (item) {
        if (_.has(item, 'search.type')) {

            // 【原始表格搜索值】
            // --------------------------------------------------

            const value = [
                // 值1
                {
                    // 比较类型
                    type: COMPARE_TYPE_MAPS[item.search.type][0],
                    // 值
                    value: '',
                },
                // 值2
                {
                    // 比较类型
                    type: COMPARE_TYPE_MAPS[item.search.type][1],
                    // 值
                    value: '',
                },
            ]

            // 如果是日期
            if (item.search.type === 'date') {
                // 设置日期类型
                value[0].dateType = 'day'
            }

            // 获取初始化值
            const defaultValue = _.get(item, 'search.value')
            if (utils.isFillArray(defaultValue)) {
                _.merge(value, defaultValue)
            }

            // 原始表格搜索值
            rawTableSearchValue.push(value)

            // 【设置原始表格搜索参数】
            // --------------------------------------------------

            // 搜索参数
            const newItem = _.merge({
                // 标签
                label: item.label,
            }, item.search)

            // 标识
            newItem.name = _.has(newItem, 'name') ? newItem.name : item.name

            // 如果有字典标识
            if (_.has(item, 'dict')) {
                newItem.dict = item.dict
            }

            // 原始表格搜索参数
            rawSearchOptions.push(newItem)
        }
    })

    return {
        // 原始表格搜索值
        rawTableSearchValue,
        // 原始表格搜索参数
        rawSearchOptions,
    }
}

/**
 * 获取参数
 */
async function getOptions(rawSearchOptions, format) {

    const lists = []

    if (utils.isFillArray(rawSearchOptions)) {
        for (const item of rawSearchOptions) {

            const newItem = Object.assign({}, item)

            // 格式化单个参数
            if (_.isFunction(format)) {
                const res = await utils.runAsync(format)(newItem)
                if (utils.isFillObject(res)) {
                    _.merge(newItem, res)
                }
            }

            // 如果有字典标识, 则一定是下拉菜单
            if (_.has(newItem, 'dict')) {
                _.merge(newItem, {
                    searchType: 'select',
                    select: {
                        options: utils.dictOptions(newItem.dict)
                    },
                })

            // 如果有下拉菜单选项
            } else if (_.has(newItem, 'select')) {
                newItem.searchType = 'select'
                newItem.select = Object.assign({
                    options: [],
                }, newItem.select)

                // 如果下拉选项是方法
                if (_.isFunction(newItem.select.options)) {
                    // 读取下拉选项
                    newItem.select.options = await utils.runAsync(newItem.select.options)()
                }

            // 如果有树选项
            } else if (_.has(newItem, 'tree')) {
                newItem.searchType = 'tree'
                newItem.tree = Object.assign({
                    nodes: [],
                    accordion: true,
                }, newItem.tree)

                // 如果节点数组是方法
                if (_.isFunction(newItem.tree.nodes)) {
                    // 读取下拉选项
                    newItem.tree.nodes = await utils.runAsync(newItem.tree.nodes)()
                }

            // 否则为输入框
            } else {
                newItem.searchType = 'input'
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

    utils.forEach(rawSearchOptions, function ({ name, type }, itemIndex) {

        // 添加值1
        function addValue1(value1) {

            // 如果有值1
            if (utils.isValidValue(value1.value)) {

                // 如果值1 类型为 in / not in
                if (utils.indexOf([dicts.SEARCH_TYPE__IN, dicts.SEARCH_TYPE__NOT_IN], value1.type) > -1) {
                    const vals = []
                    utils.forEach(utils.split(utils.trimString(value1.value).replaceAll('，', ','), ','), function (item) {
                        item = utils.numberDeep(item)
                        if (utils.isValidValue(item)) {
                            vals.push(item)
                        }
                    })
                    if (vals.length) {
                        lists.push({
                            name,
                            type: value1.type,
                            value: vals,
                        })
                    }
                    return
                }

                // 否则添加值1
                lists.push({
                    name,
                    type: value1.type,
                    value: utils.numberDeep(value1.value),
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
                && value1.type >= 20
            ) {
                const res = getQuickRange(value1.type - 20, true)
                if (res) {

                    lists.push(
                        // 日期起
                        {
                            name,
                            // ≥
                            type: dicts.SEARCH_TYPE__GTE,
                            value: utils.numberDeep(quasarDate.formatDate(utils.toDate(`${res.date.from} ${res.time.from}`), 'X')),
                        },
                        // 日期止
                        {
                            name,
                            // ≤
                            type: dicts.SEARCH_TYPE__LTE,
                            value: utils.numberDeep(quasarDate.formatDate(utils.toDate(`${res.date.to} ${res.time.to}`), 'X')),
                        }
                    )
                }
                return
            }

            // 添加值1
            addValue1(value1)

            // 只有值1 类型为 > / ≥ 值2才有效
            if (utils.indexOf([dicts.SEARCH_TYPE__GT, dicts.SEARCH_TYPE__GTE], value1.type) > -1) {
                const value2 = searchValue[itemIndex][1]
                if (utils.isValidValue(value2.value)) {
                    lists.push({
                        name,
                        type: value2.type,
                        value: utils.numberDeep(value2.value),
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
utils.$search = {
    // 获取原始值
    getRawData,
    // 获取参数
    getOptions,
    // 格式化值
    formatValue,
}
