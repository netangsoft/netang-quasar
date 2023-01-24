import { ref, computed, provide, inject, watch } from 'vue'
import { date, useQuasar } from 'quasar'

// 表格配置
import tablesConfig from '@/tables'

import {
    // 设置单个搜索值
    setItemValue,
} from './$search'

import { NPowerKey, NTableKey, NDialogKey } from './symbols'

/**
 * 创建表格
 */
function create(params) {

    // ==========【数据】=================================================================================================

    // quasar 对象
    const $q = useQuasar()

    // 每页显示行数选项
    // const rowsPerPageOptions = [30, 40, 50, 100, 200, 500, 1000]
    const rowsPerPageOptions = [2, 40, 50, 100, 200, 500, 1000]

    // 获取参数
    const o = _.merge({
        // 路由路径
        path: '',
        // 路由参数
        query: {},
        // 表格行唯一键值
        rowKey: 'id',
        // 选择类型, 可选值 single multiple none
        selection: 'multiple',
        // 表格加载状态
        loading: false,
        // 表格列数据(对象数组)
        columns: [],
        // 可见列
        visibleColumns: [],
        // 表格行数据
        rows: [],
        // 表格翻页参数
        pagination: {
            // 页码
            page: 1,
            // 每页的数据条数
            rowsPerPage: rowsPerPageOptions[0],
            // 数据总数(服务器返回)
            rowsNumber: 1,
            // 排序字段
            sortBy: null,
            // sortBy: 'id',
            // 是否降序排列
            descending: true,
        },
        // 每页显示行数选项
        rowsPerPageOptions,
        // 请求方法
        request: null,
        // 格式化单条数据
        formatRow: null,
        // 格式化参数
        // formatQuery: null,
        // http 设置
        httpSettings: {},
        // 是否开启初始搜素
        search: true,
        // 是否开启合计
        summary: false,
        // 从参数中获取搜索值
        searchFromQuery: true,
        // 显示宫格
        showGrid: true,
        // 显示可见列
        showVisibleColumns: true,
        // 开启缓存
        cache: true,
    }, params)

    // 获取权限注入
    const $power = _.has(params, '$power') ? params.$power : inject(NPowerKey)
    const hasPowr = !! $power

    // 获取权限路由
    const $route = utils.isValidString(o.path) ?
        // 如果为自定义路由
        utils.router.resolve({
            path: o.path,
            query: utils.isValidObject(o.query) ? o.query : {},
        })
        // 否则获取当前路由
        : (hasPowr ? $power.getRoute() : utils.router.getRoute())

    // 是否有权限按钮
    const hasPowerBtns = hasPowr ? ! $power.powerBtns.value.length : false

    // 表格已选数据
    const tableSelected = hasPowr ? $power.tableSelected : ref([])

    // 是否开启缓存
    const isCache = !! o.cache

    // 缓存名
    const cacheName = $route.fullPath ? $route.fullPath : (utils.isValidString(o.cache) ? o.cache : '')

    // 表格列
    const tableColumns = []

    // 如果有权限按钮
    if (hasPowerBtns) {
        // 添加操作列
        o.columns.push({
            label: '操作',
            name: 'settings',
        })
    }

    // 表格图片标识数组
    const tableImgNames = ref([])

    // 设置列参数
    utils.forEach(o.columns, function(item) {

        if (
            ! _.has(item, 'field')
            && _.has(item, 'name')
        ) {
            item.field = item.name
        }

        if (! _.has(item, 'align')) {
            item.align = 'left'
        }

        // 如果有显示项
        if (_.get(item, 'visible') !== false) {
            o.visibleColumns.push(item.field)
        }

        // 如果有时间戳
        if (_.has(item, 'time')) {
            item.format = val => date.formatDate(utils.toDate(val), item.time === true ? `YYYY-MM-DD HH:mm` : item.time)

        // 如果有数据字典
        } else if (_.has(item, 'dict')) {
            item.format = val => utils.dict(item.dict, val)

        // 如果有图片
        } else if (_.has(item, 'img') && item.img === true) {
            tableImgNames.value.push(item.name)

        // 如果有价格
        } else if (_.has(item, 'price')) {
            item.format = val => utils.price(val)
        }

        // 如果有路由
        if (_.get(item, 'route')) {
            // 如果该值在当前路由路径中, 则显示
            if (utils.indexOf($route.fullPath, item.route) > -1) {
                tableColumns.push(item)
            }

        } else {
            tableColumns.push(item)
        }
    })

    // 获取可见列缓存
    const visibleColumnsCache = o.showVisibleColumns && isCache ? utils.storage.get('table_visible_columns_' + cacheName) : []

    // 表格可见列
    const tableVisibleColumns = ref(Array.isArray(visibleColumnsCache) ? visibleColumnsCache : _.uniq([...o.visibleColumns]))

    // 表格节点
    const tableRef = ref(null)

    // 表格加载状态
    const tableLoading = ref(o.loading)

    // 表格行数据
    const tableRows = ref(o.rows)

    // 表格翻页参数
    const tablePagination = ref($route.fullPath ? o.pagination : {})

    // 表格宫格
    const tableGrid = ref(o.showGrid && isCache ? utils.storage.get('table_grid_' + cacheName) === true : false)

    // 表格传参
    const tableQuery = ref({})

    // 表格请求参数(将表格传参中的搜索参数剥离掉, 剩下的直接当做参数传递给服务器)
    let tableRequestQuery = {}

    // 是否请求表格合计
    let isRequestSummary = false

    // 表格合计
    const tableSummary = ref(null)

    const {
        // 原始参数
        rawQuery,
        // 原始表格搜索参数
        rawSearchOptions,
        // 原始表格搜索值(空表格搜索值, 用于搜索重置)
        rawTableSearchValue,
        // 首次表格搜索值(如果表格搜索参数中带了初始值, 则设置初始值)
        firstTableSearchValue,
        // 表格搜索值(如果表格搜索参数中带了初始值, 则设置初始值)
    } = utils.$search.getRawData(tableColumns, Object.assign({}, $route.query), o.searchFromQuery)

    // 表格搜索数据值
    const tableSearchValue = ref($route.fullPath ? firstTableSearchValue : [])

    // 表格搜索参数
    const tableSearchOptions = ref()

    // ==========【计算属性】=============================================================================================

    /**
     * 固定在表格右边的权限按钮列表
     */
    const tableFixedPowerBtns = ! hasPowerBtns ? ref([]) : computed(function () {

        const lists = []

        // 先格式化权限按钮列表
        utils.forEach(utils.$power.formatBtns($power.powerBtns.value), function(item) {

            // 如果是固定按钮
            if (item.fixed) {
                lists.push(item)
            }
        })

        return lists
    })

    /**
     * 获取权限按钮中可双击的按钮
     */
    const tableDbClickPowerBtn = ! hasPowerBtns ? ref(null) : computed(function () {
        if (
            // 非手机模式
            ! $q.platform.is.mobile
            // 有权限列表
            && utils.isValidArray($power.powerBtns.value)
        ) {
            for (const item of $power.powerBtns.value) {
                if (_.has(item, 'data.dbclick') === true) {
                    return item
                }
            }
        }
    })

    /**
     * 是否显示固定在右边的权限按钮列表
     */
    const showTableFixed = computed(function () {
        return utils.indexOf(tableVisibleColumns.value, 'settings') > -1
    })

    // ==========【监听数据】=============================================================================================

    /**
     * 监听表格宫格模式
     */
    if (o.showGrid && isCache) {
        watch(tableGrid, function(val) {

            // 设置宫格模式缓存(永久缓存)
            // #if ! IS_DEV
            utils.storage.set('table_grid_' + cacheName, val, 0)
            // #endif
        })
    }

    /**
     * 监听表格可见列
     */
    if (o.showVisibleColumns && isCache) {
        watch(tableVisibleColumns, function(val) {

            // 设置可见列缓存(永久缓存)
            // #if ! IS_DEV
            utils.storage.set('table_visible_columns_' + cacheName, val, 0)
            // #endif
        })
    }

    /**
     * 监听固定在右边的权限按钮列表
     */
    if (hasPowerBtns) {
        watch(tableFixedPowerBtns, function (lists) {

            const index = utils.indexOf(tableVisibleColumns.value, 'settings')

            // 如果有固定在右边的权限按钮列表
            if (utils.isValidArray(lists)) {

                // 如果设置不在可见列中
                if (index === -1) {

                    // 如果非手机模式
                    if (! $q.platform.is.mobile) {

                        // 则将设置加入可见列中
                        tableVisibleColumns.value.push('settings')
                    }

                // 否则在可见列中 && 如果是手机模式
                } else if ($q.platform.is.mobile) {

                    // 则将设置从可见列中删除
                    tableVisibleColumns.value.splice(index, 1)
                }

            // 否则如果设置在可见列中
            } else if (index > -1) {

                // 则将设置从可见列中删除
                tableVisibleColumns.value.splice(index, 1)
            }

        }, {
            // 立即执行
            immediate: true,
        })
    }

    /**
     * 监听表格传参
     */
    watch(tableQuery, function (query) {

        // 如果禁止从参数中获取搜索值
        if (! o.searchFromQuery) {
            tableRequestQuery = query
            return
        }

        const newQuery = {}

        if (utils.isValidObject(query)) {

            // 搜索参数键值数组
            const searchQueryKey = []

            utils.forEach(rawSearchOptions, function (item, index) {
                // 如果传参在搜索参数中
                if (_.has(query, item.name)) {
                    // 设置单个搜索值
                    setItemValue(tableSearchValue.value[index], utils.isRequired(query[item.name]) ? query[item.name] : '')
                    // 设置参数中搜索的 key
                    searchQueryKey.push(item.name)
                }
            })

            if (! searchQueryKey.length) {
                tableRequestQuery = query
                return
            }

            utils.forIn(query, function(val, key) {
                if (searchQueryKey.indexOf(key) === -1) {
                    newQuery[key] = val
                }
            })
        }

        tableRequestQuery = newQuery
    })

    // ==========【方法】================================================================================================

    /**
     * 表格刷新
     */
    function tableRefresh() {

        if (! $route.fullPath) {
            return
        }

        // 请求表格合计
        if (o.summary) {
            isRequestSummary = true
        }
        // 请求表格数据
        tableRef.value.requestServerInteraction()
        // 清空表格已选数据
        tableSelected.value = []
    }

    /**
     * 表格重新加载
     */
    function tableReload() {

        if (! $route.fullPath) {
            return
        }

        // 请求表格合计
        if (o.summary) {
            isRequestSummary = true
        }
        // 请求表格数据
        tableRef.value.requestServerInteraction({
            pagination: o.pagination,
        })
        // 清空表格已选数据
        tableSelected.value = []
    }

    /**
     * 表格搜索重置
     */
    function tableSearchReset() {

        // 还原表格搜索数据
        tableSearchValue.value = _.cloneDeep(rawTableSearchValue)

        // 表格重新加载
        tableReload()
    }

    /**
     * 请求数据
     */
    async function tableRequest(props) {

        // 解构数据
        const {
            // filter,
            pagination: {
                page,
                rowsPerPage,
                sortBy,
                descending,
            }
        } = props

        // 设置加载中
        tableLoading.value = true

        // 请求数据
        const data = {
            // 页码
            page,
            // 每页的数据条数
            per_page: rowsPerPage,
        }

        // 如果排序字段是有效值
        if (utils.isValidValue(sortBy)) {
            Object.assign(data, {
                // 排序字段
                order_by: sortBy,
                // 是否降序排列
                is_desc: descending ? 1 : 0,
            })
        }

        // 合并参数
        utils.forIn(Object.assign({}, rawQuery, tableRequestQuery), function(value, key) {
            // 如果有值
            if (utils.isRequired(value)) {
                data[key] = value
            }
        })

        // 获取搜索值
        const search = utils.$search.formatValue(rawSearchOptions, tableSearchValue.value)
        if (utils.isValidArray(search)) {
            data.search = _.has(data, 'search') ? _.concat(data.search, search) : search
        }

        // 如果请求表格合计
        if (isRequestSummary) {
            data.summary = 1
        }

        // 请求数据
        let result

        // 如果有自定义请求方法
        if (_.isFunction(o.request)) {
            result = await utils.runAsync(o.request)({
                data,
                props,
                tableRef,
                rows: tableRows,
                selected: tableSelected,
            })

        // 否则请求服务器
        } else {
            const opts = Object.assign({
                // 请求 - 登录
                url: $route.fullPath,
                // 请求数据
                data,
                // ~~~~~~ 先开启防抖, 如果后期遇到表格加载不出来的情况, 再关闭防抖
                // 关闭防抖(允许重复请求)
                // debounce: false,
            }, o.httpSettings)

            result = await utils.http(opts)
        }

        const { status, data: res } = result

        // 请求成功
        if (status) {

            const {
                // 返回数据
                rows,
                // 数据总数
                total,
            } = res

            // 如果请求表格合计
            if (isRequestSummary) {
                const summary = _.get(res, 'summary')
                tableSummary.value = utils.isValidObject(summary) ? summary : null
            }

            // 更新页码
            tablePagination.value.page = page
            // 更新每页的数据条数
            tablePagination.value.rowsPerPage = rowsPerPage
            // 更新数据总数
            tablePagination.value.rowsNumber = total
            // 更新排序字段
            tablePagination.value.sortBy = sortBy
            // 更新是否降序排列
            tablePagination.value.descending = descending

            // 格式化单条数据
            if (_.isFunction(o.formatRow)) {
                utils.forEach(rows, function(row) {
                    o.formatRow({
                        row,
                        tableRef,
                        rows: tableRows,
                        selected: tableSelected,
                    })
                })
            }

            // 清除现有数据并添加新数据
            tableRows.value.splice(0, tableRows.value.length, ...rows)
        }

        // 取消请求表格合计
        isRequestSummary = false

        // 取消加载
        tableLoading.value = false
    }

    /**
     * 单击表格行
     */
    function tableRowClick(e, row) {

        // 如果选择类型为无
        if (o.selection === 'none') {
            // 则无任何操作
            return
        }

        // 如果选择类型为单选
        if (o.selection === 'single') {
            tableSelected.value = [ row ]

        // 否则为多选
        } else {

            const opt = {}
            opt[o.rowKey] = row[o.rowKey]

            // 获取当前数据索引
            const itemIndex = _.findIndex(tableSelected.value, opt)

            // 如果不存在
            if (itemIndex === -1) {
                // 则添加
                tableSelected.value.push(row)

            // 否则
            } else {
                // 删除
                tableSelected.value.splice(itemIndex, 1)
            }
        }
    }

    /**
     * 双击表格行
     */
    function tableRowDblclick(e, row) {

        // 如果选择类型为无
        if (o.selection === 'none') {
            // 则无任何操作
            return
        }

        if (
            // 有权限
            hasPowr
            // 有双击的权限按钮
            && tableDbClickPowerBtn.value
        ) {
             $power.powerBtnClick(tableDbClickPowerBtn.value, [ row ])
        }
    }

    /**
     * 设置表格搜索参数
     */
    async function setTableSearchOptions(format) {
        tableSearchOptions.value = await utils.$search.getOptions(rawSearchOptions, format)
    }

    // 如果开启搜索
    if (o.search) {
        // 设置表格搜索参数
        setTableSearchOptions()
            .finally()
    }

    // ==========【返回】=================================================================================================

    const resTable = {
        // 当前路由全路径
        routeFullPath: $route.fullPath,
        // 当前路由路径
        routePath: $route.path,
        // 当前路由参数
        routeQuery: $route.query,
        // 获取当前路由
        getRoute() {
            return $route
        },

        // 表格节点
        tableRef,
        // 表格加载状态
        tableLoading,
        // 表格 id key
        tableRowKey: o.rowKey,
        // 表格选择类型
        tableSelection: o.selection,
        // 表格每页显示行数选项
        tableRowsPerPageOptions: rowsPerPageOptions,
        // 表格列数据(对象数组)
        tableColumns,
        // 表格可见列
        tableVisibleColumns,
        // 表格行数据
        tableRows,
        // 表格翻页参数
        tablePagination,
        // 表格已选数据
        tableSelected,
        // 固定在右边的权限按钮列表
        tableFixedPowerBtns,
        // 是否显示固定在右边的权限按钮列表
        showTableFixed,
        // 表格图片标识
        tableImgNames,

        // 表格宫格
        tableGrid,
        // 表格传参
        tableQuery,
        // 表格合计
        tableSummary,
        // 表格搜索数据
        tableSearchValue,
        // 表格搜索参数
        tableSearchOptions,

        // 表格刷新
        tableRefresh,
        // 表格重新加载
        tableReload,
        // 表格请求数据
        tableRequest,
        // 表格单击表格行
        tableRowClick,
        // 表格双击表格行
        tableRowDblclick,
        // 表格搜索重置
        tableSearchReset,
        // 设置表格搜索参数
        setTableSearchOptions,
    }

    if (hasPowr) {
        $power.update(function(data, _data) {
            _data.$table = resTable
        })
    }

    // 提供可以被后代组件注入的值
    provide(NTableKey, resTable)

    return resTable
}

/**
 * 获取配置
 */
function config(routePath, path, defaultValue) {
    return _.get(tablesConfig, utils.slash(routePath, 'start', false) + (path ? '.' + path : ''), defaultValue)
}

/**
 * 业务表格
 */
utils.$table = {
    // 创建表格
    create,
    // 获取配置
    config,
}
