import { ref, inject } from 'vue'

import $n_has from 'lodash/has'
import $n_get from 'lodash/get'
import $n_cloneDeep from 'lodash/cloneDeep'
import $n_merge from 'lodash/merge'
import $n_isFunction from 'lodash/isFunction'
import $n_concat from 'lodash/concat'

import $n_router from '@netang/utils/vue/router'

import $n_forEach from '@netang/utils/forEach'
import $n_isValidArray from '@netang/utils/isValidArray'
import $n_isValidString from '@netang/utils/isValidString'
import $n_indexOf from '@netang/utils/indexOf'

import $n_isRequired from '@netang/utils/isRequired'
import $n_forIn from '@netang/utils/forIn'
import $n_runAsync from '@netang/utils/runAsync'
import $n_isValidObject from '@netang/utils/isValidObject'
import $n_http from '@netang/utils/http'
import $n_run from '@netang/utils/run'

import {
    // 从表格列获取原始值
    getRawData,
    // 获取参数
    getOptions,
    // 格式化值
    formatValue,
} from './useSearch'

import { NPowerKey } from './symbols'

/**
 * 创建搜索
 */
function create(options) {

    // ==========【数据】=================================================================================================

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
        // 初始搜索加载状态
        loading: false,
        // 搜索列数据(对象数组)
        columns: [],
        // 自定义请求方法
        request: null,
        // 格式化单条数据
        formatRow: null,
        // http 设置
        httpSettings: {},
        // 从参数中获取搜索值
        searchFromQuery: true,
        // 请求成功执行
        requestSuccess: null,
        // 请求失败执行
        requestFail: null,
        // 请求后执行
        requestAfter: null,
    }

    let o
    let $power
    let hasPowr
    let $route

    // 表格加载状态
    let tableLoading
    // 表格请求参数(将表格传参中的搜索参数剥离掉, 剩下的直接当做参数传递给服务器)
    let tableRequestQuery

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

        // 获取权限路由
        $route = $n_isValidString(o.path) ?
            // 如果为自定义路由
            $n_router.resolve({
                path: o.path,
                query: $n_isValidObject(o.query) ? o.query : {},
            })
            // 否则获取当前路由
            : (hasPowr ? $power.getRoute() : $n_router.getRoute())

        // 表格列
        const _tableColumns = []

        // 设置表格列数据
        // 设置列参数
        $n_forEach(o.columns, function(item) {

            // 是否隐藏
            item.hide = $n_get(item, 'hide') === true

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

            // 表格加载状态
            tableLoading.value = o.loading

            // 表格搜索数据值
            tableSearchValue.value = _tableSearchValue

            // 表格搜索参数
            tableSearchOptions.value = null

        } else {

            // 表格加载状态
            tableLoading = ref(o.loading)

            // 表格搜索数据值
            tableSearchValue = ref(_tableSearchValue)

            // 表格搜索参数
            tableSearchOptions = ref(null)
        }

        // 表格请求参数(将表格传参中的搜索参数剥离掉, 剩下的直接当做参数传递给服务器)
        tableRequestQuery = {}

        // 是否已加载
        _isTableLoaded = false

        // 设置表格搜索参数
        setTableSearchOptions()
            .finally()

        if (_isCreated) {

            // 重新赋值
            Object.assign(resTable, {
                // 当前路由全路径
                routeFullPath: $route.fullPath,
                // 当前路由路径
                routePath: $route.path,
                // 当前路由参数
                routeQuery: $route.query,
            })
        }
    }

    // ==========【方法】================================================================================================

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

        // 请求表格数据
        return await tableRequest()
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
    function getTableRequestData() {

        // 请求数据
        const data = {}

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

        return data
    }

    /**
     * 请求数据
     */
    async function tableRequest() {

        // 加载
        tableLoading.value = true

        // http 请求参数
        const httpOptions = Object.assign({
            // 请求数据
            url: $n_isValidString(o.url) ? o.url : $route.path,
            // 请求数据
            data: getTableRequestData(),
            // ~~~~~~ 先开启防抖, 如果后期遇到表格加载不出来的情况, 再关闭防抖
            // 关闭防抖(允许重复请求)
            debounce: false,
        }, o.httpSettings)

        const e = $n_isFunction(o.request)
            // 如果有自定义请求方法
            ? await $n_runAsync(o.request)({
                // http 请求参数
                httpOptions,
            })
            // 否则请求服务器
            : await $n_http(httpOptions)

        // 取消加载
        tableLoading.value = false

        if (e.status) {
            // 请求成功执行
            $n_run(o.requestSuccess)(e)
        } else {
            // 请求失败执行
            $n_run(o.requestFail)(e)
        }
        // 请求后执行
        $n_run(o.requestAfter)(e)
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

        // 搜索加载状态
        searchLoading: tableLoading,

        // 搜索数据
        searchValue: tableSearchValue,
        // 搜索参数
        searchOptions: tableSearchOptions,

        // 搜索是否已加载
        isSearchLoaded: isTableLoaded,
        // 搜索加载(只加载一次)
        searchLoad: tableLoad,
        // 表格重新加载
        searchReload: tableReload,
        // 搜索重置
        searchReset: tableSearchReset,
        // 获取搜索请求数据
        getSearchRequestData: getTableRequestData,
        // 搜索请求数据
        searchRequest: tableRequest,
        // 设置搜索参数
        setSearchOptions: setTableSearchOptions,

        // 是否有搜索值
        hasSearchValue: hasTableSearchValue,

        // 获取当前路由
        getRoute() {
            return $route
        },
        // 重新创建搜索
        reCreate,
    }

    return resTable
}

/**
 * 业务搜索
 */
const $search = {
    // 创建搜索
    create,
}

export default $search
