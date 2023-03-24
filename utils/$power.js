import { provide, inject, ref, computed } from 'vue'
import { useQuasar } from 'quasar'

import $n_has from 'lodash/has'
import $n_get from 'lodash/get'
import $n_merge from 'lodash/merge'
import $n_filter from 'lodash/filter'
import $n_toLower from 'lodash/toLower'
import $n_isNumber from 'lodash/isNumber'
import $n_cloneDeep from 'lodash/cloneDeep'
import $n_isFunction from 'lodash/isFunction'
import $n_pick from 'lodash/pick'

import $n_router from '@netang/utils/vue/router'

import $n_isValidArray from '@netang/utils/isValidArray'
import $n_isValidObject from '@netang/utils/isValidObject'
import $n_isValidString from '@netang/utils/isValidString'
import $n_isRequired from '@netang/utils/isRequired'
import $n_isNumeric from '@netang/utils/isNumeric'
import $n_forEach from '@netang/utils/forEach'
import $n_forIn from '@netang/utils/forIn'
import $n_slash from '@netang/utils/slash'
import $n_json from '@netang/utils/json'
import $n_join from '@netang/utils/join'
import $n_fail from '@netang/utils/fail'
import $n_success from '@netang/utils/success'
import $n_split from '@netang/utils/split'
import $n_trimString from '@netang/utils/trimString'
import $n_numberDeep from '@netang/utils/numberDeep'
import $n_indexOf from '@netang/utils/indexOf'
import $n_runAsync from '@netang/utils/runAsync'
import $n_run from '@netang/utils/run'
import $n_http from '@netang/utils/http'

import { statePower } from '../store'
import { NRenderKey, NPowerKey, NDialogKey, NFormKey, NTableKey } from './symbols'

import $n_getData from './getData'
import $n_toast from './toast'
import $n_confirm from './confirm'
import $n_bus from './bus'

import $n_config from './config'

import { configs } from './config'

const {
    // 字典常量
    dicts,
} = configs

/**
 * 创建权限实例
 */
function create(options) {

    // 获取参数
    const o = Object.assign({
        // 路由路径
        path: '',
        // 路由参数
        query: {},
        // 是否加载页面
        pageLoading: false,
        // 页面状态
        pageStatus: null,
        // 空状态描述
        emptyDescription: '',
        // 是否开启权限
        power: true,
        // 是否显示权限按钮
        showPowerBtns: true,
        // 是否显示工具栏权限按钮
        showToolbarPowerBtns: true,
        // 格式化权限按钮
        formatPowerBtns: null,
        // 左边侧滑菜单图标
        leftDrawerIcon: 'format_list_bulleted',
        // 右边侧滑菜单图标
        rightDrawerIcon: 'search',
        // 请求前执行
        requestBefore: null,
        // 请求成功执行
        requestSuccess: null,
        // 请求失败执行
        requestFail: null,
        // 请求后执行
        requestAfter: null,
    }, options)

    // 获取对话框渲染注入
    const $dialog = $n_has(options, '$dialog') ? options.$dialog : inject(NDialogKey)
    const hasDialog = !! $dialog

    // 获取渲染注入
    const $render = $n_has(options, '$render') ? options.$render :  inject(NRenderKey)
    const hasRender = !! $render

    // 如果有对话框注入
    if (hasDialog) {
        const {
            dialogProps,
        } = $dialog

        // 合并权限参数
        Object.assign(o, $n_pick(dialogProps, [ 'path', 'query' ]))

        // 合并权限参数
        if ($n_has($dialog, 'props.powerProps') && $n_isValidObject($dialog.props.powerProps)) {
            $n_merge(o, $dialog.props.powerProps)
        }
    }

    // 如果有渲染注入
    if (hasRender) {
        // 如果有权限传参, 则合并参数
        const powerProps = $n_get($render, 'props.powerProps')
        if ($n_isValidObject(powerProps)) {
            $n_merge(o, powerProps)
        }
    }

    // 获取当前路由
    const $currentRoute = $n_router.getRoute()

    // 权限路由
    let $route

    // 如果没有路由
    if (o.path === false) {

        // 设为空路由
        $route = {
            fullPath: '',
            path: '',
            query: $n_isValidObject(o.query) ? o.query : {},
        }

    // 如果有自定义路径
    } else if ($n_isValidString(o.path)) {

        // 获取自定义路由
        $route = $n_router.resolve({
            path: o.path,
            query: $n_isValidObject(o.query) ? o.query : {},
        })

    // 如果在渲染组件内 && 该渲染组件有自定义路由
    } else if (hasRender && $n_has($render, 'getRoute')) {

        // 设为渲染组件的路由
        $route = $render.getRoute()

    // 否则获取当前路由
    } else {

        $route = $currentRoute
    }

    // quasar 对象
    const $q = useQuasar()

    // 表格已选数据
    const tableSelected = ref([])

    // 是否显示左边侧滑菜单
    const leftDrawerModelValue = ref(null)

    // 是否显示右边侧滑菜单
    const rightDrawerModelValue = ref(null)

    /**
     * 检查是否上传中
     */
    function checkUploading() {
        for (const uploader of data.uploader) {
            if (uploader.checkUploading()) {
                return true
            }
        }
        return false
    }

    const _data = {
        // 表格实例
        $table: null,
        // 表单实例
        $form: null,
    }

    // 注入数据
    const data = {
        // 页面加载
        pageLoading: ref(o.pageLoading),
        // 页面状态
        pageStatus: ref(o.pageStatus),
        // 空状态描述
        emptyDescription: ref(o.emptyDescription),

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
        // 格式化权限按钮
        formatPowerBtns: o.formatPowerBtns,

        // 左边侧滑菜单数据
        leftDrawer: {
            // 图标
            icon: o.leftDrawerIcon,
            // 是否显示
            modelValue: leftDrawerModelValue,
            // 是否显示切换按钮
            showButton() {
                return leftDrawerModelValue.value !== null
            },
            // 切换
            toggle() {
                if (leftDrawerModelValue.value !== null) {
                    leftDrawerModelValue.value = ! leftDrawerModelValue.value
                }
            },
        },
        // 右边侧滑菜单数据
        rightDrawer: {
            // 图标
            icon: o.rightDrawerIcon,
            // 是否显示
            modelValue: rightDrawerModelValue,
            // 是否显示切换按钮
            showButton() {
                return rightDrawerModelValue.value !== null
            },
            // 切换
            toggle() {
                if (rightDrawerModelValue.value !== null) {
                    rightDrawerModelValue.value = ! rightDrawerModelValue.value
                }
            },
        },
        // 表格已选数据
        tableSelected,
        // 上传器
        uploader: [],
        // 检查是否上传中
        checkUploading,
    }

    // 如果是权限页面
    if (o.power) {

        // 获取当前页面角色权限
        const { status, data: res } = getPageData($route)
        if (! status) {
            o.pageStatus = false
            o.emptyDescription = res.msg
            o.power = false

        } else {
            // 当前页面权限
            data.powerPage = res.page
            // 当前页面权限按钮
            data.powerBtns = ref(o.showPowerBtns ? res.btns : [])
            // 当前页面工具栏权限按钮
            data.toolbarPowerBtns = computed(function() {

                if (
                    // 如果显示工具栏权限按钮
                    o.showToolbarPowerBtns
                    // 有权限按钮数据
                    && $n_isValidArray(data.powerBtns.value)
                ) {
                    const lists = []

                    // 格式化权限按钮列表
                    $n_forEach($n_filter(formatBtns(data.powerBtns.value), e => e.type > 2), function(item) {

                        if (! item.hidden) {

                            // 如果是单条数据显示
                            const isSingle = item.show === 'single'

                            // 如果是单条 || 多条显示
                            if (isSingle || item.show === 'multiple') {

                                // 初始为不显示
                                item.show = false

                                // 如果有表格选中数据
                                if ($n_isValidArray(data.tableSelected.value)) {
                                    // 如果是单个显示
                                    if (isSingle) {
                                        item.show = data.tableSelected.value.length === 1

                                    // 否则是多个显示
                                    } else {
                                        item.show = data.tableSelected.value.length >= 1
                                    }
                                }
                            }

                            // 如果是手机模式
                            if ($q.platform.is.mobile) {
                                item.icon = undefined
                            }
                        }

                        if (
                            // 如果有格式化权限按钮方法
                            $n_isFunction(o.formatPowerBtns)
                            && o.formatPowerBtns(item, false, tableSelected.value) === false
                        ) {
                            return
                        }

                        lists.push(item)
                    })

                    return lists
                }

                return []
            })

            // 权限按钮点击
            data.powerBtnClick = async function (powerBtn, tableSelected) {

                // 权限请求
                await request({
                    // power
                    $power: data,
                    // 按钮数据
                    powerBtn,
                    // 权限路由参数
                    $route,
                    // 当前路由参数
                    $currentRoute,
                    // 表格选中数据
                    tableSelected,
                    // 表格实例
                    $table: _data.$table,
                    // 表单实例
                    $form: _data.$form,
                    // 检查是否正在上传文件
                    checkUploading,

                    // 请求前执行
                    requestBefore: o.requestBefore,
                    // 请求成功执行
                    requestSuccess: o.requestSuccess,
                    // 请求失败执行
                    requestFail: o.requestFail,
                    // 请求后执行
                    requestAfter: o.requestAfter,
                })
            }
        }
    }

    // 如果没有开启权限
    if (! o.power) {
        // 当前页面权限
        data.powerPage = {}
        // 当前页面权限按钮
        data.powerBtns = ref([])
        // 当前页面工具栏权限按钮
        data.toolbarPowerBtns = ref([])
        // 权限按钮点击
        data.powerBtnClick = ()=>{}
    }

    // 更新数据
    data.update = function(cb) {
        cb(data, _data)
    }

    // 提供可以被后代组件注入的值
    provide(NPowerKey, data)

    return data
}

/**
 * 设置权限数据
 */
function setData(data) {

    // 如果没有角色数据
    if (! $n_isValidObject(data)) {
        return
    }

    const {
        rows,
        v,
    } = data

    if (! $n_isValidArray(rows) || ! v) {
        return
    }

    // all id
    const all = {}
    // 页面
    const urls = {}
    // 按钮
    const btns = {}
    // 菜单
    const menus = []

    for (const item of rows) {

        // 【格式化 start】
        // --------------------------------------------------
        if (item.data) {
            item.data = $n_json.parse(item.data)
        }
        item.data = $n_isValidObject(item.data) ? $n_numberDeep(item.data) : {}

        // 设置数据类型
        item.data.type = item.data_type
        delete item.data_type

        // 标识
        item.name = ''

        // 如果有 url
        if ($n_isValidString(item.url)) {

            // url 首位加上反斜杠
            item.url = $n_slash($n_toLower($n_trimString(item.url)), 'start', true)
            if (item.url) {

                item.data.url = item.url

                // 截取最后一个反斜杠
                const lastIndex = item.data.url.lastIndexOf('/')
                if (lastIndex > -1) {
                    item.name = item.data.url.substring(lastIndex + 1)
                }

            } else {
                item.url = ''
                item.data.url = ''
            }

        } else {
            item.url = ''
            item.data.url = ''
        }

        // 菜单
        if (item.type === 1) {
            menus.push(item)

        // 按钮
        } else if (item.type > 2) {

            // 按钮类型
            switch (item.type) {

                // 默认按钮
                case 11:
                    item.color = 'default'
                    break;

                // 主要按钮
                case 12:
                    item.color = 'primary'
                    break;

                // 成功按钮
                case 13:
                    item.color = 'secondary'
                    break;

                // 信息按钮
                case 14:
                    item.color = 'info'
                    break;

                // 警告按钮
                case 15:
                    item.color = 'warning'
                    break;

                // 危险按钮
                case 16:
                    item.color = 'negative'
                    break;

                // 隐藏按钮
                case 20:
                    item.hidden = true
                    break;
            }
        }
        // 【格式化 end】
        // --------------------------------------------------

        // url
        if (item.url) {
            // 添加至 all
            all[item.id] = item
            // 添加至页面
            urls[item.url] = item
        }
    }

    for (const item of rows) {

        // 如果有跳转页面
        if ($n_has(item.data, 'toPage')) {
            // 设置跳转页面地址
            item.data.toPage = $n_has(all, item.data.toPage) ? all[item.data.toPage].data.url : null
        }

        // 如果有请求成功执行类型
        // else if ($n_has(item.data, 'requestSuccess.type')) {
        //     // 如果请求成功执行类型是关闭窗口、跳转并刷新页面
        //     if (item.data.requestSuccess.type === 'closePushRefresh') {
        //         // 设置刷新页面地址
        //         item.data.requestSuccess.params =
        //             (
        //                 // 如果有刷新页面的参数 id
        //                 $n_has(item.data.requestSuccess, 'params')
        //                 // 如果有页面数据
        //                 && $n_has(all, item.data.requestSuccess.params)
        //             ) ? all[item.data.requestSuccess.params].data.url : null
        //     }
        // }

        if (
            // 数据/按钮
            item.type > 1
            // 有父级数据
            && $n_has(all, item.pid)
        ) {
            const pItem = all[item.pid]
            if ($n_has(btns, pItem.url)) {
                btns[pItem.url].push(item)
            } else {
                btns[pItem.url] = [item]
            }
        }
    }

    // 保存至权限状态中
    statePower.value = {
        // 角色权限版本
        v,
        // all id
        all,
        // 页面
        urls,
        // 按钮
        btns,
        // 菜单
        menus,
    }
}

/**
 * 获取权限
 */
async function getData() {

    // 如果没有权限数据
    if (! statePower.value.v) {

        // 获取权限数据
        const res = await $n_getData($n_config('apiDataPowerName'))
        if (res === false) {
            statePower.value = {
                // 权限版本
                v: null,
                // all id
                all: {},
                // 页面
                urls: {},
                // 按钮
                btns: {},
                // 菜单
                menus: [],
            }
            return $n_fail()
        }
    }

    // 如果有权限状态数据, 则直接返回
    if (statePower.value.v) {
        return $n_success($n_cloneDeep(statePower.value))
    }

    return $n_fail()
}

/**
 * 解析传参
 */
function parseQuery(data, settings) {

    // 如果配置是字符串
    if ($n_isValidString(settings)) {

        // 如果返回所有传参
        if (settings === 'all') {
            return $n_isValidObject(data) ? data : {}
        }

        // 将字符串放到数组中
        settings = [settings]

    // 如果配置是对象
    } else if ($n_isValidObject(settings)) {
        settings = [settings]
    }

    const query = {}

    // 如果配置是数组
    if ($n_isValidArray(settings)) {

        // 别名
        const alias = {}

        for (let item of settings) {
            // 如果是需要的字段
            if ($n_isValidString(item)) {

                // 将字段转小写
                item = $n_toLower($n_trimString(item))

                // 判断字段是否有 as 别名
                const arr = $n_split(item, ' as ')

                // 如果有别名
                if (arr.length === 2) {
                    alias[$n_trimString(arr[0])] = $n_trimString(arr[1])

                // 否则别名就是当前字段本身
                } else {
                    alias[item] = item
                }

            // 否则如果是自定义传参
            } else if ($n_isValidObject(item)) {
                Object.assign(query, item)
            }
        }

        if (
            // 如果有参数数据
            $n_isValidObject(data)
            // 如果有定义别名
            && $n_isValidObject(alias)
        ) {
            $n_forIn(data, function(value, key) {

                // 如果当前字段在别名中
                if ($n_has(alias, key)) {
                    query[alias[key]] = value
                }
            })
        }
    }

    return query
}

/**
 * 格式化权限按钮
 */
function formatBtns(powerBtns, filterBtns, toObject = false) {

    const newLists = []

    $n_forEach(powerBtns, function(item) {

        item = $n_cloneDeep(item)

        const {
            name,
            icon,
        } = item

        Object.assign(item, {
            // 图标
            icon: icon || undefined,
            // 隐藏按钮
            hidden: $n_get(item, 'hidden') === true,
            // 显示按钮类型
            show: $n_has(item, 'data.show') ? item.data.show : true,
        })

        // 是否固定按钮
        item.fixed =
            // 非隐藏按钮
            ! item.hidden
            // 固定列
            && $n_get(item, 'data.fixed') === true
            // 单个按钮
            && item.show === 'single'
            // 按钮有图标
            && !! item.icon

        // 如果是对象
        if ($n_isValidObject(filterBtns)) {
            if ($n_has(filterBtns, name)) {
                newLists.push($n_merge(item, filterBtns[name]))
            }

        // 如果是数组
        } else if ($n_isValidArray(filterBtns)) {
            if ($n_indexOf(filterBtns, name) > -1) {
                newLists.push($n_merge(item, filterBtns[name]))
            }

        } else {
            newLists.push(item)
        }
    })

    // 转数组
    if (toObject) {
        const obj = {}
        for (const item of newLists) {
            obj[item.name] = item
        }
        return obj
    }

    return newLists
}

/**
 * 获取请求传参
 */
function getRequestQuery(o) {

    // 传参
    const query = {}

    // 如果有请求传参的传参设置
    if ($n_has(o.powerBtn.data, 'requestQuery.query')) {
        const resQuery = parseQuery(o.query, o.powerBtn.data.requestQuery.query)
        if ($n_isValidObject(resQuery)) {
            Object.assign(query, resQuery)
        }
    }

    // 获取列表数据
    if (
        // 如果按钮参数有显示类型
        $n_has(o.powerBtn.data, 'show')
        // 按钮参数的显示类型必须是单选或多选
        && $n_indexOf(['single', 'multiple'], o.powerBtn.data.show) > -1
        // 如果有请求传参的列表设置
        && $n_has(o.powerBtn.data, 'requestQuery.list')
        // 如果有表格数据
        && $n_isValidArray(o.tableSelected)
    ) {
        let newQuery = {}

        // 如果是单选
        if (o.powerBtn.data.show === 'single') {
            // 取表格选中第一条数据
            newQuery = o.tableSelected[0]

        // 否则是多选
        } else {
            // 合并表格选中的每一条数据
            for (const item of o.tableSelected) {
                $n_forIn(item, function(value, key) {
                    if ($n_has(newQuery, key)) {
                        newQuery[key].push(value)
                    } else {
                        newQuery[key] = [value]
                    }
                })
            }
        }

        const resTable = parseQuery(newQuery, o.powerBtn.data.requestQuery.list)
        if ($n_isValidObject(resTable)) {
            Object.assign(query, resTable)
        }
    }

    return $n_cloneDeep($n_numberDeep(query))
}

/**
 * 格式化参数
 */
function formatQuery(query, isJoinArr) {

    const newQuery = {}

    // 格式化参数
    $n_forIn(query, function(value, key) {

        // 如果是数字
        if ($n_isNumeric(value)) {
            newQuery[key] = $n_isNumber(value) ? value : Number(value)

        // 如果是字符串
        } else if ($n_isValidString(value)) {
            newQuery[key] = $n_trimString(value)

        // 如果是数组
        } else if ($n_isValidArray(value)) {

            const arr = []
            for (const val of value) {

                // 如果为有效值
                if ($n_isRequired(val)) {

                    // 如果是数字
                    if ($n_isNumeric(val)) {
                        arr.push($n_isNumber(val) ? val : Number(val))

                    // 如果是字符串
                    } else if ($n_isValidString(val)) {
                        arr.push($n_trimString(val))

                    // 否则为数组或对象
                    } else {
                        arr.push(val)
                    }
                }
            }
            if (arr.length) {
                newQuery[key] = isJoinArr ? $n_join(arr, ',') : arr
            }
        }
    })

    return newQuery
}

/**
 * 角色请求
 */
async function request(options) {

    // 参数
    const o = Object.assign({
        // 权限按钮数据
        powerBtn: {},
        // 表格选中数据
        tableSelected: [],
        // 检查是否正在上传文件
        checkUploading: null,
        // 请求前执行
        requestBefore: null,
        // 请求成功执行
        requestSuccess: null,
        // 请求失败执行
        requestFail: null,
        // 请求后执行
        requestAfter: null,
    }, options)

    const {
        // 权限路由参数
        $route,
        // 当前路由参数
        $currentRoute,
    } = options

    o.query = $route.query

    // 判断类型
    if (! $n_get(o.powerBtn, 'data.type')) {

        // 【调试模式】
        // --------------------------------------------------
        // #ifdef IS_DEBUG
        console.log('没有定义数据类型')
        // #endif
        // --------------------------------------------------

        return
    }

    // 克隆按钮
    o.powerBtn = $n_cloneDeep(o.powerBtn)

    // 判断 url
    o.powerBtn.data.url = $n_toLower($n_trimString(o.powerBtn.data.url))
    if (! o.powerBtn.data.url) {

        if (
            // 如果没有跳转页面地址
            ! $n_has(o.powerBtn.data, 'toPage')
            // 或跳转页面地址为空
            || ! $n_isValidString(o.powerBtn.data.toPage)
        ) {
            // 【调试模式】
            // --------------------------------------------------
            // #ifdef IS_DEBUG
            console.log('没有定义 url')
            // #endif
            // --------------------------------------------------

            return
        }

        // 用跳转页面地址替换 toPage
        o.powerBtn.data = Object.assign({}, o.powerBtn.data, {
            url: o.powerBtn.data.toPage,
        })
    }

    // 获取请求参数
    let query = getRequestQuery(o)

    // 如果是打开新窗口
    // --------------------------------------------------
    if (o.powerBtn.data.type === dicts.POWER_DATA_TYPE__OPEN) {

        query = formatQuery(query, true)

        // 如果按钮有标题
        const pageTitle = $n_trimString(o.powerBtn.title)
        if (pageTitle) {
            query.n_page_title = pageTitle
        }

        // 如果不是禁止添加来源页面参数
        if ($n_get(o.powerBtn.data, 'noFromPageQuery') !== true) {
            // 来源页面是当前路由的完整路径
            query.n_from_page = encodeURIComponent($currentRoute.fullPath)
        }

        // 请求前执行
        const resBefore = await $n_runAsync(o.requestBefore)({
            options: o,
            requestData: query,
        })
        if (resBefore !== void 0) {
            if (resBefore === false) {
                return
            }
            query = resBefore
        }

        $n_router.push({
            path: o.powerBtn.data.url,
            query,
        })
        return
    }

    // 请求数据
    let requestData = {}

    // 如果是提交表单
    // --------------------------------------------------
    if (o.powerBtn.data.type === dicts.POWER_DATA_TYPE__FORM) {

        // 获取表单注入
        o.$form = $n_has(options, '$form') ? options.$form : inject(NFormKey)

        if (! o.$form) {
            throw new Error('没有创建表单实例')
        }

        // 如果验证表单
        if ($n_get(o.powerBtn.data, 'validate') !== false) {

            if (! o.$form.formRef) {
                throw new Error('没有绑定 fromRef')
            }

            // 验证表单
            if (! await o.$form.formRef.value.validate()) {
                return
            }
        }

        // 验证表单数据
        if (! $n_isValidObject(o.$form.formData.value)) {
            throw new Error('没有获取到表单数据')
        }

        // 检查是否正在上传文件
        if ($n_isFunction(o.checkUploading) && o.checkUploading()) {
            // 轻提示
            $n_toast({
                message: '文件上传中，请耐心等待',
            })
            return
        }

        // 获取请求数据
        requestData = $n_merge({}, formatQuery(query, false), o.$form.formData.value)

        // 合并请求原始表单数据
        if ($n_isValidObject(o.$form.requestRawFormData.value)) {
            Object.assign(requestData, {
                n__raw: o.$form.requestRawFormData.value
            })
        }

    // 如果是请求数据
    // --------------------------------------------------
    } else {
        // 获取表格注入
        o.$table = $n_has(options, '$table') ? options.$table : inject(NTableKey)

        // 获取请求数据
        requestData = formatQuery(query, false)
    }

    // 判断是否有确认框
    const isConfirm = $n_get(o.powerBtn.data, 'confirm')
    if (
        // 如果有确认框
        isConfirm
        // 如果有密码确认框
        || $n_get(o.powerBtn.data, 'confirmPassword')
    ) {
        // 如果需要先弹出确认框
        if (isConfirm) {

            // 确认框
            $n_confirm({
                // 重要操作，请输入登录密码并确认后操作
                message: $n_isValidString(isConfirm) ? isConfirm : '确认要执行该操作吗？',
            })
                // 点击确认执行
                .onOk(onRequest)

            return
        }
    }

    // 否则执行请求
    await onRequest()

    /**
     * 请求事件
     */
    async function onRequest() {

        // 请求前执行
        const resBefore = await $n_runAsync(o.requestBefore)({
            options: o,
            requestData,
        })
        if (resBefore !== void 0) {
            if (resBefore === false) {
                return
            }
            requestData = resBefore
        }

        // 请求
        const res = await $n_http({
            // 请求地址
            url: o.powerBtn.data.url,
            // 请求数据
            data: requestData,
        })

        // 返回结果数据
        const resultData = Object.assign({
            // 参数
            options: o,
            // 请求数据
            requestData,
        }, res)

        // 请求后执行
        if (await $n_runAsync(o.requestAfter)(resultData) === false) {
            return
        }

        // 如果请求成功
        if (res.status) {

            // 下一步
            function next(isNotify = true) {

                // 轻提示
                if (isNotify) {
                    $n_toast({
                        type: 'positive',
                        message: '恭喜您，操作成功',
                    })
                }

                // 判断是否有请求成功后的操作动作
                if ($n_has(o.powerBtn.data, 'requestSuccess.type')) {
                    switch (o.powerBtn.data.requestSuccess.type) {

                        // 关闭当前页面
                        case 'close':
                        // 关闭窗口并跳转页面
                        case 'closePush':
                        // 关闭窗口、跳转并刷新页面
                        case 'closePushRefresh':

                            // 如果是渲染页面
                            // 说明该页面在 <table-splitter> 组件内部被渲染, 则不需要关闭当前窗口
                            if ($n_has($route.query, 'n_render_page') && $route.query.n_render_page === 1) {
                                // 则无任何操作
                                return
                            }

                            const opts = {
                                type: 'closeCurrentTab',
                            }

                            if (
                                // 如果不是关闭当前页面, 则为关闭窗口并跳转页面
                                o.powerBtn.data.requestSuccess.type !== 'close'
                                // 如果有来源页面
                                && $n_has($route.query, 'n_from_page')
                                && $n_isValidString($route.query.n_from_page)
                            ) {
                                Object.assign(opts, {
                                    // 跳转页面地址
                                    pushPage: decodeURIComponent($route.query.n_from_page),
                                    // 是否跳转并刷新页面
                                    isPushRefresh: o.powerBtn.data.requestSuccess.type === 'closePushRefresh',
                                })

                                // 否则如果定义了跳转页面
                                // else if ($n_has(o.powerBtn.data, 'requestSuccess.params') && $n_isValidString(o.powerBtn.data.requestSuccess.params)) {
                                //     pushPage = o.powerBtn.data.requestSuccess.params
                                // }
                            }

                            // 关闭当前标签页
                            $n_bus.emit('main', opts)
                            break

                        // 重置表单
                        case 'resetForm':
                            $n_run(o.$form?.resetForm)()
                            break

                        // 刷新列表
                        case 'refreshList':
                            $n_run(o.$table?.tableRefresh)()
                            break
                    }
                }
            }

            // 请求成功执行
            if (await $n_runAsync(o.requestSuccess)(Object.assign({ next }, resultData)) === false) {
                return
            }

            // 下一步
            next()

        } else {
            // 请求失败执行
            $n_run(o.requestFail)(resultData)
        }
    }
}

/**
 * 获取路由页面的角色权限
 */
function getPageData($route) {

    if (! $route) {
        $route = $n_router.getRoute()
    }

    const path = $n_get($route, 'path')
    if (! path) {
        return $n_fail('路由参数错误')
    }

    if (! statePower.value.v) {
        return $n_fail('没有获取到权限数据')
    }

    // 获取角色数据
    const { urls, btns } = $n_cloneDeep(statePower.value)
    if (! $n_has(urls, path)) {
        return $n_fail('该页面没有权限')
    }

    return $n_success({
        page: urls[path],
        btns: $n_has(btns, path) ? btns[path] : [],
    })
}

/**
 * 权限业务
 */
const $power = {
    // 创建权限实例
    create,
    // 设置权限数据
    setData,
    // 获取权限数据
    getData,
    // 获取路由页面的角色权限
    getPageData,
    // 格式化权限按钮
    formatBtns,
    // 请求
    request,
}

export default $power
