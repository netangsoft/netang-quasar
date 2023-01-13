import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { date, useQuasar } from 'quasar'

/**
 * 设置参数
 */
function setQuery(data, query) {
    const newQuery = {}
    utils.forIn(query, function(value, key) {
        // 如果有值
        if (utils.isRequired(value)) {
            newQuery[key] = value
        }
    })
    if (utils.isFillObject(newQuery)) {
        _.merge(data, newQuery)
    }
}

/**
 * 创建表格
 */
function create(params) {

    // ==========【数据】=================================================================================================

    // quasar 对象
    const $q = useQuasar()

    // 每页显示行数选项
    const rowsPerPageOptions = [30, 40, 50, 100, 200, 500, 1000]

    // 获取参数
    const o = _.merge({
        // 请求地址
        url: '',
        // 表格节点
        ref: null,
        // id key
        rowKey: 'id',
        // 选择类型, 可选值 single multiple none
        selection: 'multiple',
        // 表格加载状态
        loading: false,
        // 表格列数据
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
        // 已选数据
        selected: [],
        // 每页显示行数选项
        rowsPerPageOptions,
        // 请求方法
        request: null,
        // 格式化单条数据
        formatRow: null,
        // 格式化参数
        formatQuery: null,
        // http 设置
        httpSettings: {},
        // 是否开启初始搜素
        search: true,
        // 是否开启合计
        summary: false,
        // 权限按钮列表
        roleBtnLists: null,
    }, params)

    // 如果没有地址, 则使用当前路由地址
    if (! o.url) {
        // 当前路由
        o.url = useRoute().fullPath
    }

    // 宫格模式缓存名
    const gridCacheName = 'table_grid_' + o.url

    // 可见列缓存名
    const visibleColumnsCacheName = 'table_visible_columns_' + o.url

    // 表格列
    const tableColumns = []

    // 添加操作列
    o.columns.push({
        label: '操作',
        name: 'settings',
    })

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
            if (utils.indexOf(o.url, item.route) > -1) {
                tableColumns.push(item)
            }

        } else {
            tableColumns.push(item)
        }
    })

    // 获取可见列缓存
    const visibleColumnsCache = utils.storage.get(visibleColumnsCacheName)

    // 表格可见列
    const tableVisibleColumns = ref(Array.isArray(visibleColumnsCache) ? visibleColumnsCache : _.uniq([...o.visibleColumns]))

    // 表格工具栏节点
    const tableToolbarRef = ref(null)

    // 表格节点
    const tableRef = ref(o.ref)

    // 表格加载状态
    const tableLoading = ref(o.loading)

    // 表格行数据
    const tableRows = ref(o.rows)

    // 表格翻页参数
    const tablePagination = ref(o.pagination)

    // 表格已选数据
    const tableSelected = ref(o.selected)

    // 表格宫格
    const tableGrid = ref(utils.storage.get(gridCacheName) === true)

    // 表格传参
    const tableQuery = ref({})

    // 是否请求表格合计
    let isRequestSummary = false
    // 表格合计
    const tableSummary = ref(null)

    const {
        // 原始表格搜索值
        rawTableSearchValue,
        // 原始表格搜索参数
        rawSearchOptions,
    } = utils.$search.getRawData(tableColumns)

    // 表格搜索数据值
    const tableSearchValue = ref(rawTableSearchValue)

    // 表格搜索参数
    const tableSearchOptions = ref()

    // ==========【计算属性】=============================================================================================

    // 固定在右边的权限按钮列表
    const tableFixedRoleBtnLists = computed(function () {

        const lists = []

        // 先格式化权限按钮列表
        utils.forEach(utils.$role.formatRoleBtnLists(o.roleBtnLists.value), function(item) {
            // 如果是固定按钮
            if (item.fixed) {
                lists.push(item)
            }
        })

        return lists
    })

    /**
     * 表格双击权限按钮
     */
    const tableDbClickRoleBtn = computed(function () {
        if (
            // 非手机模式
            ! $q.platform.is.mobile
            // 有权限列表
            && utils.isFillArray(o.roleBtnLists.value)
        ) {
            for (const item of o.roleBtnLists.value) {
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
    watch(tableGrid, function(val) {

        // 设置宫格模式缓存(永久缓存)
        // #if ! IS_DEV
            utils.storage.set(gridCacheName, val, 0)
        // #endif
    })

    /**
     * 监听表格可见列
     */
    watch(tableVisibleColumns, function(val) {

        // 设置可见列缓存(永久缓存)
        // #if ! IS_DEV
        utils.storage.set(visibleColumnsCacheName, val, 0)
        // #endif
    })

    /**
     * 监听固定在右边的权限按钮列表
     */
    watch(tableFixedRoleBtnLists, function (lists) {

        const index = utils.indexOf(tableVisibleColumns.value, 'settings')

        // 如果有固定在右边的权限按钮列表
        if (utils.isFillArray(lists)) {

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
     * 表格刷新
     */
    function tableRefresh() {
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

        // 合并筛选数据
        // setQuery(data, filter)

        // 合并传参数据
        setQuery(data, _.isFunction(o.formatQuery) ? o.formatQuery(tableQuery.value) : tableQuery.value)

        // 获取搜索值
        const search = utils.$search.formatValue(rawSearchOptions, tableSearchValue.value)
        if (utils.isFillArray(search)) {
            data.search = _.has(data, 'search') ? _.concat(data.search, search) : search
        }

        // 如果请求表格合计
        if (isRequestSummary) {
            data.summary = 1
        }

        // 请求数据
        const { status, data: res } = _.isFunction(o.request) ?
            // 如果有自定义请求方法
            await utils.runAsync(o.request)({
                data,
                props,
                tableRef,
                rows: tableRows,
                selected: tableSelected,
            })
            // 否则请求服务器数据
            : await utils.http(Object.assign({
                // 请求 - 登录
                url: o.url,
                // 请求数据
                data,
                // ~~~~~~ 先开启防抖, 如果后期遇到表格加载不出来的情况, 再关闭防抖
                // 关闭防抖(允许重复请求)
                // debounce: false,
            }, o.httpSettings))

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
                tableSummary.value = utils.isFillObject(summary) ? summary : null
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
    function tableRowClick(e, row, index) {

        // 如果选择类型为无
        if (o.selection === 'none') {
            // 则无任何操作
            return
        }

        const opt = {}
        opt[o.rowKey] = row[o.rowKey]

        // 获取当前数据索引
        const itemIndex = _.findIndex(tableSelected.value, opt)

        // 如果不存在, 则添加
        if (itemIndex === -1) {

            // 如果选择类型为单选
            if (o.selection === 'single') {
                tableSelected.value = [row]
            // 否则为多选
            } else {
                tableSelected.value.push(row)
            }

        // 否则删除
        } else {
            tableSelected.value.splice(itemIndex, 1)
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

        // 有双击的权限按钮
        if (tableDbClickRoleBtn.value) {
            tableToolbarRef.value?.onClick(tableDbClickRoleBtn.value, [ row ])
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

    return {
        // 表格工具栏节点
        tableToolbarRef,
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
        // 表格列数据
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
        tableFixedRoleBtnLists,
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
}

/**
 * 业务表格
 */
utils.$table = {
    // 创建表格
    create,
}
