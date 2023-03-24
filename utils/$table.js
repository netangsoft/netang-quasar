import { ref, computed, provide, inject, watch } from 'vue'
import { useQuasar } from 'quasar'

import $n_has from 'lodash/has'
import $n_get from 'lodash/get'
import $n_cloneDeep from 'lodash/cloneDeep'
import $n_merge from 'lodash/merge'
import $n_isFunction from 'lodash/isFunction'
import $n_findIndex from 'lodash/findIndex'
import $n_uniq from 'lodash/uniq'
import $n_concat from 'lodash/concat'
import $n_isNil from 'lodash/isNil'

import $n_router from '@netang/utils/vue/router'

import $n_forEach from '@netang/utils/forEach'
import $n_isValidArray from '@netang/utils/isValidArray'
import $n_isValidString from '@netang/utils/isValidString'
import $n_indexOf from '@netang/utils/indexOf'
import $n_storage from '@netang/utils/storage'

import $n_isRequired from '@netang/utils/isRequired'
import $n_forIn from '@netang/utils/forIn'
import $n_runAsync from '@netang/utils/runAsync'
import $n_isValidObject from '@netang/utils/isValidObject'
import $n_isValidValue from '@netang/utils/isValidValue'
import $n_slash from '@netang/utils/slash'
import $n_http from '@netang/utils/http'

import $n_$power from './$power'
import $n_dict from './dict'
import $n_price from './price'
import $n_getTime from './getTime'

import { configs } from './config'

import {
    // 设置单个搜索值
    setItemValue,
    // 从表格列获取原始值
    getRawData,
    // 获取参数
    getOptions,
    // 格式化值
    formatValue,
} from './useSearch'

import { NRenderKey, NPowerKey, NTableKey } from './symbols'

const {
    // 表格配置
    tablesConfig,
} = configs

/**
 * 创建表格
 */
function create(options) {

    // ==========【数据】=================================================================================================

    // quasar 对象
    const $q = useQuasar()

    // 每页显示行数选项
    const rowsPerPageOptions = [30, 40, 50, 100, 200, 500, 1000]

    // 原始参数
    const rawOptions = {
        // 路由路径
        path: '',
        // 请求地址(默认为 path)
        url: '',
        // 路由参数
        query: {},
        // 附加请求数据
        data: {},
        // 表格行唯一键值
        rowKey: 'id',
        // 选择类型, 可选值 none single(默认) multiple
        // selection: '',
        // 分隔栏, 可选值 horizontal vertical cell none
        separator: 'cell',
        // 初始已选数据
        selected: [],
        // 初始表格加载状态
        loading: false,
        // 表格列数据(对象数组)
        columns: [],
        // 初始可见列
        visibleColumns: [],
        // 表格行数据
        rows: [],
        // 表格翻页参数
        pagination: {
            // 页码
            page: 1,
            // 每页的数据条数
            rowsPerPage: $n_has(options, 'rowsPerPageOptions') ? options.rowsPerPageOptions[0] : rowsPerPageOptions[0],
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
        // 自定义请求方法
        request: null,
        // 格式化单条数据
        formatRow: null,
        // http 设置
        httpSettings: {},
        // 是否开启初始搜素
        search: true,
        // 是否开启合计
        summary: false,
        // 从参数中获取搜索值
        searchFromQuery: true,
        // 是否显示宫格
        showGrid: true,
        // 是否显示可见列
        showVisibleColumns: true,
        // 是否开启缓存
        cache: true,
        // 是否刷新后清空已选数据
        refreshResetSelected: true,

        // 单击表格行事件
        rowClick: null,
        // 双击表格行事件
        rowDblClick: null,
    }

    let o
    let $power
    let hasPowr
    let $render
    let $route
    let hasPowerBtns
    let tableSelected
    let isCache
    let cacheName
    let tableColumns
    let tableImgNames

    // 获取可见列缓存
    let visibleColumnsCache
    // 表格可见列
    let tableVisibleColumns
    // 表格加载状态
    let tableLoading
    // 表格行数据
    let tableRows
    // 表格翻页参数
    let tablePagination
    // 表格宫格
    let tableGrid
    // 表格请求参数(将表格传参中的搜索参数剥离掉, 剩下的直接当做参数传递给服务器)
    let tableRequestQuery
    // 是否请求表格合计
    let isRequestSummary
    // 表格合计
    let tableSummary
    // 表格选择类型
    let tableSelection
    // 表格分隔栏
    let tableSeparator

    // 原始参数
    let rawQuery
    // 原始表格搜索参数
    let rawSearchOptions
    // 原始表格搜索值(空表格搜索值, 用于搜索重置)
    let rawTableSearchValue
    // 首次表格搜索值(如果表格搜索参数中带了初始值, 则设置初始值)
    let firstTableSearchValue

    // 表格搜索数据值
    let tableSearchValue
    // 表格搜索参数
    let tableSearchOptions
    // 是否已加载
    let _isTableLoaded

    // 是否已生成数据
    let _isCreated = false

    // 创建表格
    reCreate(options)

    // 已生成数据
    _isCreated = true

    // ==========【方法】================================================================================================

    /**
     * 重新创建表格
     */
    function reCreate(options) {

        // 获取参数
        o = $n_merge({}, rawOptions, options)

        // 获取权限注入
        $power = $n_has(options, '$power') ? options.$power : (_isCreated ? $power : inject(NPowerKey))
        hasPowr = !! $power

        // 获取渲染注入
        $render = $n_has(options, '$render') ? options.$render : (_isCreated ? $render : inject(NRenderKey))
        if (!! $render) {
            // 如果有表格传参, 则合并参数
            const tableProps = $n_get($render, 'props.tableProps')
            if ($n_isValidObject(tableProps)) {
                $n_merge(o, tableProps)
            }
        }

        // 获取选择类型(默认 single)
        if (! $n_has(o, 'selection') || ! $n_isValidString(o.selection)) {
            if (hasPowr) {
                o.selection = $n_get($power, 'powerPage.data.selection')
                if (! $n_isValidString(o.selection)) {
                    o.selection = 'single'
                }
            } else {
                o.selection = 'single'
            }
        }

        // 获取权限路由
        $route = $n_isValidString(o.path) ?
            // 如果为自定义路由
            $n_router.resolve({
                path: o.path,
                query: $n_isValidObject(o.query) ? o.query : {},
            })
            // 否则获取当前路由
            : (hasPowr ? $power.getRoute() : $n_router.getRoute())

        // 是否有权限按钮
        const _hasPowerBtns = hasPowr ? $power.powerBtns.value.length : false
        if (_isCreated) {
            hasPowerBtns.value = _hasPowerBtns
        } else {
            hasPowerBtns = ref(_hasPowerBtns)
        }

        // 表格已选数据
        if (hasPowr) {
            tableSelected = $power.tableSelected
        } else if (_isCreated) {
            tableSelected.value = []
        } else {
            tableSelected = ref([])
        }
        if ($n_isValidArray(o.selected)) {
            tableSelected.value = o.selected
        }

        // 是否开启缓存
        isCache = !! o.cache

        // 缓存名
        cacheName = $route.path ? $route.path : ($n_isValidString(o.cache) ? o.cache : '')

        // 表格列
        const _tableColumns = []

        // 如果有权限按钮
        if (hasPowerBtns.value) {
            // 添加操作列
            o.columns.push({
                label: '操作',
                name: 'settings',
            })
        }

        // 表格图片标识数组
        if (_isCreated) {
            tableImgNames.value = []
        } else {
            tableImgNames = ref([])
        }

        // 设置表格列数据
        // 设置列参数
        $n_forEach(o.columns, function(item) {

            if (
                ! $n_has(item, 'field')
                && $n_has(item, 'name')
            ) {
                item.field = item.name
            }

            if (! $n_has(item, 'align')) {
                item.align = 'left'
            }

            // 是否隐藏
            item.hide = $n_get(item, 'hide') === true

            // 如果有显示项
            if ($n_get(item, 'visible') !== false) {
                o.visibleColumns.push(item.field)
            }

            // 如果有时间戳
            if ($n_has(item, 'time')) {
                item.format = val => $n_getTime(val, { format: item.time === true ? `YYYY-MM-DD HH:mm` : item.time }, '-')

                // 如果有数据字典
            } else if ($n_has(item, 'dict')) {
                item.format = val => $n_dict(item.dict, val)

                // 如果有图片
            } else if ($n_has(item, 'img') && item.img === true) {
                tableImgNames.value.push(item.name)

                // 如果有价格
            } else if ($n_has(item, 'price')) {
                item.format = val => $n_price(val)
            }

            // 如果有路由
            if ($n_get(item, 'route')) {
                // 如果该值在当前路由路径中, 则显示
                if ($n_indexOf($route.fullPath, item.route) > -1) {
                    _tableColumns.push(item)
                }

            } else {
                _tableColumns.push(item)
            }
        })

        // 获取可见列缓存
        visibleColumnsCache = o.showVisibleColumns && isCache ? $n_storage.get('table:visible_columns:' + cacheName) : []

        // 表格可见列
        const _tableVisibleColumns = Array.isArray(visibleColumnsCache) ? visibleColumnsCache : $n_uniq([...o.visibleColumns])

        // 表格翻页参数
        const _tablePagination = $route.fullPath ? o.pagination : {}

        // 表格宫格
        const _tableGrid = o.showGrid && isCache ? $n_storage.get('table:grid:' + cacheName) === true : false

        // 获取原始数据
        const r = getRawData(_tableColumns, Object.assign({}, $route.query), o.searchFromQuery)
        // 原始参数
        rawQuery = r.rawQuery
        // 原始表格搜索参数
        rawSearchOptions = r.rawSearchOptions
        // 原始表格搜索值(空表格搜索值, 用于搜索重置)
        rawTableSearchValue = r.rawTableSearchValue
        // 首次表格搜索值(如果表格搜索参数中带了初始值, 则设置初始值)
        firstTableSearchValue = r.firstTableSearchValue

        // 表格搜索数据值
        const _tableSearchValue = $route.fullPath ? firstTableSearchValue : []

        if (_isCreated) {

            // 表格列
            tableColumns.value = _tableColumns

            // 表格可见列
            tableVisibleColumns.value = _tableVisibleColumns

            // 表格加载状态
            tableLoading.value = o.loading

            // 表格行数据
            tableRows.value = o.rows

            // 表格翻页参数
            tablePagination.value = _tablePagination

            // 表格宫格
            tableGrid.value = _tableGrid

            // 表格合计
            tableSummary.value = null

            // 表格选择类型
            tableSelection.value = o.selection

            // 表格分隔栏
            tableSeparator.value = o.separator

            // 表格搜索数据值
            tableSearchValue.value = _tableSearchValue

            // 表格搜索参数
            tableSearchOptions.value = null

        } else {

            // 表格列
            tableColumns = ref(_tableColumns)

            // 表格可见列
            tableVisibleColumns = ref(_tableVisibleColumns)

            // 表格加载状态
            tableLoading = ref(o.loading)

            // 表格行数据
            tableRows = ref(o.rows)

            // 表格翻页参数
            tablePagination = ref(_tablePagination)

            // 表格宫格
            tableGrid = ref(_tableGrid)

            // 表格合计
            tableSummary = ref(null)

            // 表格选择类型
            tableSelection = ref(o.selection)

            // 表格分隔栏
            tableSeparator = ref(o.separator)

            // 表格搜索数据值
            tableSearchValue = ref(_tableSearchValue)

            // 表格搜索参数
            tableSearchOptions = ref(null)
        }

        // 表格请求参数(将表格传参中的搜索参数剥离掉, 剩下的直接当做参数传递给服务器)
        tableRequestQuery = {}

        // 是否请求表格合计
        isRequestSummary = false

        // 是否已加载
        _isTableLoaded = false

        // 如果开启搜索
        if (o.search) {
            // 设置表格搜索参数
            setTableSearchOptions()
                .finally()
        }

        if (_isCreated) {

            // 重新赋值
            Object.assign(resTable, {
                // 当前路由全路径
                routeFullPath: $route.fullPath,
                // 当前路由路径
                routePath: $route.path,
                // 当前路由参数
                routeQuery: $route.query,
                // 表格行唯一键值
                tableRowKey: o.rowKey,
                // 表格每页显示行数选项
                tableRowsPerPageOptions: o.rowsPerPageOptions,
            })

            if (hasPowr) {
                $power.update(function(data, _data) {
                    _data.$table = resTable
                })
            }
        }
    }

    // ==========【计算属性】=============================================================================================

    /**
     * 固定在表格右边的权限按钮列表
     */
    const tableFixedPowerBtns = computed(function () {

        const lists = []

        if (hasPowerBtns.value) {

            // 先格式化权限按钮列表
            $n_forEach($n_$power.formatBtns($power.powerBtns.value), function(item) {
                // 如果是固定按钮
                if (item.fixed) {
                    lists.push(item)
                }
            })
        }

        return lists
    })

    /**
     * 获取权限按钮中可双击的按钮
     */
    const tableDbClickPowerBtn = computed(function () {
        if (
            // 如果有权限按钮
            hasPowerBtns.value
            // 非手机模式
            && ! $q.platform.is.mobile
            // 有权限列表
            && $n_isValidArray($power.powerBtns.value)
        ) {
            for (const item of $power.powerBtns.value) {
                if ($n_has(item, 'data.dbclick') === true) {
                    return item
                }
            }
        }
    })

    /**
     * 是否显示固定在右边的权限按钮列表
     */
    const showTableFixed = computed(function () {
        return $n_indexOf(tableVisibleColumns.value, 'settings') > -1
    })

    // ==========【监听数据】=============================================================================================

    // #if ! IS_DEV

        /**
         * 监听表格宫格模式
         */
        watch(tableGrid, function(val) {
            if (o.showGrid && isCache) {
                // 设置宫格模式缓存(永久缓存)
                $n_storage.set('table:grid:' + cacheName, val, 0)
            }
        })

        /**
         * 监听表格可见列
         */
        watch(tableVisibleColumns, function(val) {
            if (o.showVisibleColumns && isCache) {
                // 设置监听表格可见列缓存(永久缓存)
                $n_storage.set('table:visible_columns:' + cacheName, val, 0)
            }
        })

    // #endif

    /**
     * 监听固定在右边的权限按钮列表
     */
    watch(tableFixedPowerBtns, function (lists) {

        if (! hasPowerBtns.value) {
            return
        }

        const index = $n_indexOf(tableVisibleColumns.value, 'settings')

        // 如果有固定在右边的权限按钮列表
        if ($n_isValidArray(lists)) {

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

    // ==========【方法】================================================================================================

    /**
     * 设置表格传参
     */
    function setQuery(query) {

        if ($n_isValidObject(query)) {

            query = $n_cloneDeep(query)

            // 搜索参数键值数组
            const searchQueryKey = []

            // 搜索键值数组
            const NSearchKeys = []
            // 搜索数组
            const NSearchValues = []

            // 参数中是否有自定义搜索参数
            const hasNSearch = $n_has(query, 'n_search')
            if (hasNSearch) {
                // 删除在搜索中存在的参数键值
                $n_forIn(query.n_search, function (item, key) {
                    if ($n_has(query, key)) {
                        delete query[key]
                    }
                })
            }

            // 如果允许从参数中获取搜索值
            if (o.searchFromQuery) {

                $n_forEach(rawSearchOptions, function (item, index) {

                    const valueItem = tableSearchValue.value[index]

                    // 如果传参在搜素 n_search 参数中
                    if (hasNSearch && $n_has(query.n_search, item.name)) {
                        const newSearchItem = query.n_search[item.name]
                        if ($n_isValidArray(newSearchItem)) {
                            valueItem[0].compare = newSearchItem[0].compare
                            valueItem[0].value = newSearchItem[0].value

                            if (newSearchItem.length > 1) {
                                valueItem[1].compare = newSearchItem[1].compare
                                valueItem[1].value = newSearchItem[1].value
                            }
                        }
                        // 设置搜索的 key
                        NSearchKeys.push(item.name)

                    // 如果传参在搜索参数中
                    } else if ($n_has(query, item.name)) {
                        // 设置单个搜索值
                        setItemValue(valueItem, $n_isRequired(query[item.name]) ? query[item.name] : '')
                        // 设置参数中搜索的 key
                        searchQueryKey.push(item.name)
                    }
                })

                $n_forEach(searchQueryKey, function (key) {
                    delete query[key]
                })

                if (hasNSearch) {
                    $n_forIn(query.n_search, function(item, key) {
                        if (
                            NSearchKeys.indexOf(key) === -1
                            && $n_isValidArray(item)
                        ) {
                            item[0].field = key
                            NSearchValues.push(item[0])

                            if (item.length > 1) {
                                item[1].field = key
                                NSearchValues.push(item[1])
                            }
                        }
                    })
                }

            } else {
                $n_forIn(query.n_search, function(item, key) {
                    if ($n_isValidArray(item)) {
                        item[0].field = key
                        NSearchValues.push(item[0])
                        if (item.length > 1) {
                            item[1].field = key
                            NSearchValues.push(item[1])
                        }
                    }
                })
            }

            if (NSearchValues.length) {
                query.n_search = NSearchValues
            } else if (hasNSearch) {
                delete query.n_search
            }

            tableRequestQuery = query
            return
        }

        tableRequestQuery = {}
    }


    /**
     * 表格是否已加载
     */
    function isTableLoaded() {
        return _isTableLoaded
    }

    /**
     * 表格加载(只加载一次)
     */
    async function tableLoad() {

        // 如果表格已加载过了
        if (_isTableLoaded) {
            // 则无任何操作
            return
        }

        // 表格重新加载
        await tableReload()
    }

    /**
     * 表格重新加载
     */
    async function tableReload() {

        // 表格已加载
        _isTableLoaded = true

        if (! $route.fullPath) {
            return
        }

        // 请求表格合计
        if (o.summary) {
            isRequestSummary = true
        }

        // 请求表格数据
        // $tableRef?.requestServerInteraction({
        //     pagination: o.pagination,
        // })
        await tableRequest({
            pagination: o.pagination,
        })

        // 清空表格已选数据
        if (o.refreshResetSelected) {
            tableSelected.value = []
        }
    }

    /**
     * 表格刷新
     */
    async function tableRefresh() {

        if (! $route.fullPath) {
            return
        }

        // 请求表格合计
        if (o.summary) {
            isRequestSummary = true
        }

        // 请求表格数据
        // $tableRef.requestServerInteraction()
        await tableRequest({
            pagination: tablePagination.value,
        })

        // 清空表格已选数据
        if (o.refreshResetSelected) {
            tableSelected.value = []
        }
    }

    /**
     * 表格搜索重置
     */
    function tableSearchReset(reload = true) {

        const newValue = []

        $n_forEach(rawSearchOptions, function (item, index) {
            // 如果该搜索条件是隐藏的
            if (item.hide) {
                newValue.push(tableSearchValue.value[index])
            // 否则为初始值
            } else {
                newValue.push(rawTableSearchValue[index])
            }
        })

        // 还原表格搜索数据
        tableSearchValue.value = $n_cloneDeep(newValue)

        // 表格重新加载
        if (reload) {
            tableReload().finally()
        }
    }

    /**
     * 获取表格请求数据
     */
    function getTableRequestData(props, isSummary = undefined) {

        // 解构数据
        const {
            // filter,
            pagination: {
                // 页码
                page,
                // 每页的数据条数
                rowsPerPage,
                // 排序字段
                sortBy,
                // 是否降序排列
                descending,
            }
        } = props

        // 请求数据
        const data = {
            // 页码
            page,
            // 每页的数据条数
            per_page: rowsPerPage,
        }

        // 如果排序字段是有效值
        if ($n_isValidValue(sortBy)) {
            Object.assign(data, {
                // 排序字段
                order_by: sortBy,
                // 是否降序排列
                is_desc: descending ? 1 : 0,
            })
        }

        // 合并参数
        $n_forIn(Object.assign({}, rawQuery, tableRequestQuery, o.data), function(value, key) {
            // 如果有值
            if ($n_isRequired(value)) {
                data[key] = value
            }
        })

        // 获取搜索值
        const search = formatValue(rawSearchOptions, tableSearchValue.value)
        if ($n_isValidArray(search)) {
            data.n_search = $n_has(data, 'n_search') ? $n_concat(data.n_search, search) : search
        }

        if ($n_isNil(isSummary)) {
            isSummary = isRequestSummary
        }

        // 如果请求表格合计
        if (isSummary) {
            data.summary = 1
        }

        return data
    }

    /**
     * 请求数据
     */
    async function tableRequest(props) {

        // 加载
        tableLoading.value = true

        // 解构数据
        const {
            // filter,
            pagination: {
                // 页码
                page,
                // 每页的数据条数
                rowsPerPage,
                // 排序字段
                sortBy,
                // 是否降序排列
                descending,
            }
        } = props

        // http 请求参数
        const httpOptions = Object.assign({
            // 请求数据
            url: $n_isValidString(o.url) ? o.url : $route.path,
            // 请求数据
            data: getTableRequestData(props, isRequestSummary),
            // ~~~~~~ 先开启防抖, 如果后期遇到表格加载不出来的情况, 再关闭防抖
            // 关闭防抖(允许重复请求)
            debounce: false,
        }, o.httpSettings)

        const { status, data: res } = $n_isFunction(o.request)
            // 如果有自定义请求方法
            ? await $n_runAsync(o.request)({
                // http 请求参数
                httpOptions,
                // 表格声明属性
                props,
                // 表格行数据
                rows: tableRows,
                // 表格已选数据
                selected: tableSelected,
            })
            // 否则请求服务器
            : await $n_http(httpOptions)

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
                const summary = $n_get(res, 'summary')
                tableSummary.value = $n_isValidObject(summary) ? summary : null
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
            if ($n_isFunction(o.formatRow)) {
                $n_forEach(rows, function(row) {
                    o.formatRow({
                        row,
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
    function _tableRowClick(e, row) {

        // 如果选择类型为无
        if (tableSelection.value === 'none') {
            // 则无任何操作
            return
        }

        const opt = {}
        opt[o.rowKey] = row[o.rowKey]

        // 获取当前数据索引
        const itemIndex = $n_findIndex(tableSelected.value, opt)

        // 如果不存在, 则添加
        if (itemIndex === -1) {

            // 如果选择类型为单选
            if (tableSelection.value === 'single') {
                tableSelected.value = [ row ]

            // 否则为多选
            } else {
                tableSelected.value.push(row)
            }

        // 否则删除
        } else {
            tableSelected.value.splice(itemIndex, 1)
        }
    }
    function tableRowClick(...e) {

        // 单击表格行
        _tableRowClick(...e)

        // 如果有自定义单击事件
        if ($n_isFunction(o.rowClick)) {
            o.rowClick(...e)
        }
    }

    /**
     * 双击表格行
     */
    function _tableRowDblclick(e, row) {

        // 如果选择类型为无
        if (tableSelection.value === 'none') {
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
    function tableRowDblclick(...e) {

        // 双击表格行
        _tableRowDblclick(...e)

        // 如果有自定义双击表格行事件
        if ($n_isFunction(o.tableRowDblclick)) {
            o.tableRowDblclick(...e)
        }
    }

    /**
     * 设置表格搜索参数
     */
    async function setTableSearchOptions(format) {
        tableSearchOptions.value = await getOptions(rawSearchOptions, format)
    }

    /**
     * 是否有表格搜索值
     */
    function hasTableSearchValue() {
        return !! formatValue(rawSearchOptions, tableSearchValue.value).length
    }

    // ==========【返回】=================================================================================================

    const resTable = {
        // 当前路由全路径
        routeFullPath: $route.fullPath,
        // 当前路由路径
        routePath: $route.path,
        // 当前路由参数
        routeQuery: $route.query,
        // 表格行唯一键值
        tableRowKey: o.rowKey,
        // 表格每页显示行数选项
        tableRowsPerPageOptions: o.rowsPerPageOptions,

        // 表格加载状态
        tableLoading,
        // 表格选择类型
        tableSelection,
        // 表格分隔栏
        tableSeparator,
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
        // 表格合计
        tableSummary,
        // 表格搜索数据
        tableSearchValue,
        // 表格搜索参数
        tableSearchOptions,

        // 设置表格传参
        setQuery,
        // 表格是否已加载
        isTableLoaded,
        // 表格加载(只加载一次)
        tableLoad,
        // 表格重新加载
        tableReload,
        // 表格刷新
        tableRefresh,
        // 表格搜索重置
        tableSearchReset,
        // 获取表格请求数据
        getTableRequestData,
        // 表格请求数据
        tableRequest,
        // 表格单击表格行
        tableRowClick,
        // 表格双击表格行
        tableRowDblclick,
        // 设置表格搜索参数
        setTableSearchOptions,

        // 是否有表格搜索值
        hasTableSearchValue,

        // 获取当前路由
        getRoute() {
            return $route
        },
        // 重新创建表格
        reCreate,
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
 * 获取表格配置
 */
function config(routePath, path, defaultValue) {
    return $n_cloneDeep($n_get(tablesConfig, $n_slash(routePath, 'start', false) + (path ? '.' + path : ''), defaultValue))
}

/**
 * 业务表格
 */
const $table = {
    // 创建表格
    create,
    // 获取表格配置
    config,
}

export default $table
