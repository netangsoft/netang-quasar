import { provide, inject, ref, computed } from 'vue'
import { useQuasar } from 'quasar'

import { statePower } from '../store'
import { NRenderKey, NPowerKey, NFormKey, NTableKey } from './symbols'

/**
 * 创建权限实例
 */
function create(params) {

    // 获取参数
    const o = Object.assign({
        // 路由路径
        path: '',
        // 路由参数
        query: {},
        // 页面加载
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
    }, params)

    // 获取渲染注入
    const $render = inject(NRenderKey)

    // 如果有渲染注入
    const hasRender = !! $render
    if (hasRender) {
        // 如果有权限传参, 则合并参数
        const powerProps = $n.get($render, 'props.powerProps')
        if ($n.isValidObject(powerProps)) {
            $n.merge(o, powerProps)
        }
    }

    // 获取当前路由
    const $currentRoute = $n.router.getRoute()

    // 权限路由
    let $route

    // 如果没有路由
    if (o.path === false) {

        // 设为空路由
        $route = {
            fullPath: '',
            path: '',
            query: $n.isValidObject(o.query) ? o.query : {},
        }

    // 如果有自定义路径
    } else if ($n.isValidString(o.path)) {

        // 获取自定义路由
        $route = $n.router.resolve({
            path: o.path,
            query: $n.isValidObject(o.query) ? o.query : {},
        })

    // 如果在渲染组件内 && 该渲染组件有自定义路由
    } else if (hasRender && $n.has($render, '$route')) {

        // 设为渲染组件的路由
        $route = $render.$route

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
                    && $n.isValidArray(data.powerBtns.value)
                ) {

                    const lists = $n.filter(formatBtns(data.powerBtns.value), e => e.type > 2)

                    // 格式化权限按钮列表
                    $n.forEach(lists, function(item) {

                        if (! item.hidden) {

                            // 如果是单条数据显示
                            const isSingle = item.show === 'single'

                            // 如果是单条 || 多条显示
                            if (isSingle || item.show === 'multiple') {

                                // 初始为不显示
                                item.show = false

                                // 如果有表格选中数据
                                if ($n.isValidArray(data.tableSelected.value)) {
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
                    })

                    return lists
                }

                return []
            })

            // 权限按钮点击
            data.powerBtnClick = async function ({ data }, tableSelected) {

                // 权限请求
                await request({
                    // 按钮数据
                    data,
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
    if (! $n.isValidObject(data)) {
        return
    }

    const {
        rows,
        v,
    } = data

    if (! $n.isValidArray(rows) || ! v) {
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
            item.data = $n.json.parse(item.data)
        }
        item.data = $n.isValidObject(item.data) ? $n.numberDeep(item.data) : {}

        // 设置数据类型
        item.data.type = item.data_type
        delete item.data_type

        // 标识
        item.name = ''

        // 如果有 url
        if ($n.isValidString(item.url)) {

            // url 首位加上反斜杠
            item.url = $n.slash($n.toLower($n.trimString(item.url)), 'start', true)
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
        if ($n.has(item.data, 'toPage')) {
            // 设置跳转页面地址
            item.data.toPage = $n.has(all, item.data.toPage) ? all[item.data.toPage].data.url : null
        }

        // 如果有请求成功执行类型
        // else if ($n.has(item.data, 'requestSuccess.type')) {
        //     // 如果请求成功执行类型是关闭窗口、跳转并刷新页面
        //     if (item.data.requestSuccess.type === 'closePushRefresh') {
        //         // 设置刷新页面地址
        //         item.data.requestSuccess.params =
        //             (
        //                 // 如果有刷新页面的参数 id
        //                 $n.has(item.data.requestSuccess, 'params')
        //                 // 如果有页面数据
        //                 && $n.has(all, item.data.requestSuccess.params)
        //             ) ? all[item.data.requestSuccess.params].data.url : null
        //     }
        // }

        if (
            // 数据/按钮
            item.type > 1
            // 有父级数据
            && $n.has(all, item.pid)
        ) {
            const pItem = all[item.pid]
            if ($n.has(btns, pItem.url)) {
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
        const res = await $n.getData($n.config('powerName'))
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
            return $n.fail()
        }
    }

    // 如果有权限状态数据, 则直接返回
    if (statePower.value.v) {
        return $n.success($n.cloneDeep(statePower.value))
    }

    return $n.fail()
}

/**
 * 解析传参
 */
function parseQuery(data, settings) {

    // 如果配置是字符串
    if ($n.isValidString(settings)) {

        // 如果返回所有传参
        if (settings === 'all') {
            return $n.isValidObject(data) ? data : {}
        }

        // 将字符串放到数组中
        settings = [settings]

    // 如果配置是对象
    } else if ($n.isValidObject(settings)) {
        settings = [settings]
    }

    const query = {}

    // 如果配置是数组
    if ($n.isValidArray(settings)) {

        // 别名
        const alias = {}

        for (let item of settings) {
            // 如果是需要的字段
            if ($n.isValidString(item)) {

                // 将字段转小写
                item = $n.toLower($n.trimString(item))

                // 判断字段是否有 as 别名
                const arr = $n.split(item, ' as ')

                // 如果有别名
                if (arr.length === 2) {
                    alias[$n.trimString(arr[0])] = $n.trimString(arr[1])

                // 否则别名就是当前字段本身
                } else {
                    alias[item] = item
                }

            // 否则如果是自定义传参
            } else if ($n.isValidObject(item)) {
                Object.assign(query, item)
            }
        }

        if (
            // 如果有参数数据
            $n.isValidObject(data)
            // 如果有定义别名
            && $n.isValidObject(alias)
        ) {
            $n.forIn(data, function(value, key) {

                // 如果当前字段在别名中
                if ($n.has(alias, key)) {
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

    $n.forEach(powerBtns, function(item) {

        const {
            name,
            icon,
        } = item

        const newItem = Object.assign({}, item, {
            // 图标
            icon: icon || undefined,
            // 隐藏按钮
            hidden: $n.get(item, 'hidden') === true,
            // 显示按钮类型
            show: $n.has(item, 'data.show') ? item.data.show : true,
        })

        // 是否固定按钮
        newItem.fixed =
            // 非隐藏按钮
            ! newItem.hidden
            // 固定列
            && $n.get(newItem, 'data.fixed') === true
            // 单个按钮
            && newItem.show === 'single'
            // 按钮有图标
            && !! newItem.icon

        // 如果是对象
        if ($n.isValidObject(filterBtns)) {
            if ($n.has(filterBtns, name)) {
                newLists.push($n.merge(newItem, filterBtns[name]))
            }

        // 如果是数组
        } else if ($n.isValidArray(filterBtns)) {
            if ($n.indexOf(filterBtns, name) > -1) {
                newLists.push($n.merge(newItem, filterBtns[name]))
            }

        } else {
            newLists.push(newItem)
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
    if ($n.has(o.data, 'requestQuery.query')) {
        const resQuery = parseQuery(o.query, o.data.requestQuery.query)
        if ($n.isValidObject(resQuery)) {
            Object.assign(query, resQuery)
        }
    }

    // 获取列表数据
    if (
        // 如果按钮参数有显示类型
        $n.has(o.data, 'show')
        // 按钮参数的显示类型必须是单选或多选
        && $n.indexOf(['single', 'multiple'], o.data.show) > -1
        // 如果有请求传参的列表设置
        && $n.has(o.data, 'requestQuery.list')
        // 如果有表格数据
        && $n.isValidArray(o.tableSelected)
    ) {
        let newQuery = {}

        // 如果是单选
        if (o.data.show === 'single') {
            // 取表格选中第一条数据
            newQuery = o.tableSelected[0]

        // 否则是多选
        } else {
            // 合并表格选中的每一条数据
            for (const item of o.tableSelected) {
                $n.forIn(item, function(value, key) {
                    if ($n.has(newQuery, key)) {
                        newQuery[key].push(value)
                    } else {
                        newQuery[key] = [value]
                    }
                })
            }
        }

        const resTable = parseQuery(newQuery, o.data.requestQuery.list)
        if ($n.isValidObject(resTable)) {
            Object.assign(query, resTable)
        }
    }

    return $n.cloneDeep($n.numberDeep(query))
}

/**
 * 格式化参数
 */
function formatQuery(query, isJoinArr) {

    const newQuery = {}

    // 格式化参数
    $n.forIn(query, function(value, key) {

        // 如果是数字
        if ($n.isNumeric(value)) {
            newQuery[key] = $n.isNumber(value) ? value : Number(value)

        // 如果是字符串
        } else if ($n.isValidString(value)) {
            newQuery[key] = $n.trimString(value)

        // 如果是数组
        } else if ($n.isValidArray(value)) {

            const arr = []
            for (const val of value) {

                // 如果为有效值
                if ($n.isRequired(val)) {

                    // 如果是数字
                    if ($n.isNumeric(val)) {
                        arr.push($n.isNumber(val) ? val : Number(val))

                    // 如果是字符串
                    } else if ($n.isValidString(val)) {
                        arr.push($n.trimString(val))

                    // 否则为数组或对象
                    } else {
                        arr.push(val)
                    }
                }
            }
            if (arr.length) {
                newQuery[key] = isJoinArr ? $n.join(arr, ',') : arr
            }
        }
    })

    return newQuery
}

/**
 * 角色请求
 */
async function request(params) {

    // 参数
    const o = Object.assign({
        // 按钮数据
        data: {},
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
    }, params)

    const {
        // 权限路由参数
        $route,
        // 当前路由参数
        $currentRoute,
    } = params

    o.query = $route.query

    // 判断类型
    if (! $n.get(o.data, 'type')) {

        // 【调试模式】
        // --------------------------------------------------
        // #ifdef IS_DEBUG
        console.log('没有定义数据类型')
        // #endif
        // --------------------------------------------------

        return
    }

    // 克隆 data
    o.data = $n.cloneDeep(o.data)

    // 判断 url
    o.data.url = $n.toLower($n.trimString(o.data.url))
    if (! o.data.url) {

        if (
            // 如果没有跳转页面地址
            ! $n.has(o.data, 'toPage')
            // 或跳转页面地址为空
            || ! $n.isValidString(o.data.toPage)
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
        o.data = Object.assign({}, o.data, {
            url: o.data.toPage,
        })
    }

    // 获取请求参数
    let query = getRequestQuery(o)

    // 如果是打开新窗口
    // --------------------------------------------------
    if (o.data.type === dicts.POWER_DATA_TYPE__OPEN) {

        query = formatQuery(query, true)

        // 如果有增加来源页面参数
        if ($n.get(o.data, 'addFromPageQuery') === true) {
            // 来源页面是当前路由的完整路径
            query.n_frompage = encodeURIComponent($currentRoute.fullPath)
        }

        // 请求前执行
        const resBefore = await $n.runAsync(o.requestBefore)({ params: o, requestData: query })
        if (resBefore !== void 0) {
            if (resBefore === false) {
                return
            }
            query = resBefore
        }

        $n.router.push({
            path: o.data.url,
            query,
        })
        return
    }

    // 请求数据
    let requestData = {}

    // 如果是提交表单
    // --------------------------------------------------
    if (o.data.type === dicts.POWER_DATA_TYPE__FORM) {

        // 获取表单注入
        o.$form = $n.has(params, '$form') ? params.$form : inject(NFormKey)

        if (! o.$form) {
            throw new Error('没有创建表单实例')
        }

        // 如果验证表单
        if ($n.get(o.data, 'validate') !== false) {

            if (! o.$form.formRef) {
                throw new Error('没有绑定 fromRef')
            }

            // 验证表单
            if (! await o.$form.formRef.value.validate()) {
                return
            }
        }

        // 验证表单数据
        if (! $n.isValidObject(o.$form.formData.value)) {
            throw new Error('没有获取到表单数据')
        }

        // 检查是否正在上传文件
        if ($n.isFunction(o.checkUploading) && o.checkUploading()) {
            // 轻提示
            $n.toast({
                message: '文件上传中，请耐心等待',
            })
            return
        }

        // 获取请求数据
        requestData = $n.merge({}, formatQuery(query, false), o.$form.formData.value)

    // 如果是请求数据
    // --------------------------------------------------
    } else {
        // 获取表格注入
        o.$table = $n.has(params, '$table') ? params.$table : inject(NTableKey)

        // 获取请求数据
        requestData = formatQuery(query, false)
    }

    // 判断是否有确认框
    const isConfirm = $n.get(o.data, 'confirm')
    if (
        // 如果有确认框
        isConfirm
        // 如果有密码确认框
        || $n.get(o.data, 'confirmPassword')
    ) {
        // 如果需要先弹出确认框
        if (isConfirm) {

            // 确认框
            $n.confirm({
                // 重要操作，请输入登录密码并确认后操作
                message: $n.isValidString(isConfirm) ? isConfirm : '确认要执行该操作吗？',
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
        const resBefore = await $n.runAsync(o.requestBefore)({ params: o, requestData })
        if (resBefore !== void 0) {
            if (resBefore === false) {
                return
            }
            requestData = resBefore
        }

        // 请求
        const res = await $n.http({
            // 请求地址
            url: o.data.url,
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
        if (await $n.runAsync(o.requestAfter)(resultData) === false) {
            return
        }

        // 如果请求成功
        if (res.status) {

            // 下一步
            function next(isNotify = true) {

                // 轻提示
                if (isNotify) {
                    $n.toast({
                        type: 'positive',
                        message: '恭喜您，操作成功',
                    })
                }

                // 判断是否有请求成功后的操作动作
                if ($n.has(o.data, 'requestSuccess.type')) {
                    switch (o.data.requestSuccess.type) {

                        // 关闭当前页面
                        case 'close':
                        // 关闭窗口并跳转页面
                        case 'closePush':
                        // 关闭窗口、跳转并刷新页面
                        case 'closePushRefresh':

                            // 如果是渲染页面
                            // 说明该页面在 <table-splitter> 组件内部被渲染, 则不需要关闭当前窗口
                            if ($n.has($route.query, 'n_renderpage') && $route.query.n_renderpage === 1) {
                                // 则无任何操作
                                return
                            }

                            const opts = {
                                type: 'closeCurrentTab',
                            }

                            if (
                                // 如果不是关闭当前页面, 则为关闭窗口并跳转页面
                                o.data.requestSuccess.type !== 'close'
                                // 如果有来源页面
                                && $n.has($route.query, 'n_frompage')
                                && $n.isValidString($route.query.n_frompage)
                            ) {
                                Object.assign(opts, {
                                    // 跳转页面地址
                                    pushPage: decodeURIComponent($route.query.n_frompage),
                                    // 是否跳转并刷新页面
                                    isPushRefresh: o.data.requestSuccess.type === 'closePushRefresh',
                                })

                                // 否则如果定义了跳转页面
                                // else if ($n.has(o.data, 'requestSuccess.params') && $n.isValidString(o.data.requestSuccess.params)) {
                                //     pushPage = o.data.requestSuccess.params
                                // }
                            }

                            // 关闭当前标签页
                            $n.bus.emit('main', opts)
                            break

                        // 重置表单
                        case 'resetForm':
                            $n.run(o.$form?.resetForm)()
                            break

                        // 刷新列表
                        case 'refreshList':
                            $n.run(o.$table?.tableRefresh)()
                            break
                    }
                }
            }

            // 请求成功执行
            if (await $n.runAsync(o.requestSuccess)(Object.assign({ next }, resultData)) === false) {
                return
            }

            // 下一步
            next()

        } else {
            // 请求失败执行
            $n.run(o.requestFail)(resultData)
        }
    }
}

/**
 * 获取当前页面角色权限
 */
function getPageData($route) {

    if (! $route) {
        $route = $n.router.getRoute()
    }

    const path = $n.get($route, 'path')
    if (! path) {
        return $n.fail('路由参数错误')
    }

    if (! statePower.value.v) {
        return $n.fail('没有获取到权限数据')
    }

    // 获取角色数据
    const { urls, btns } = $n.cloneDeep(statePower.value)
    if (! $n.has(urls, path)) {
        return $n.fail('该页面没有权限')
    }

    return $n.success({
        page: urls[path],
        btns: $n.has(btns, path) ? btns[path] : [],
    })
}

/**
 * 权限业务
 */
$n.$power = {
    // 创建
    create,
    // 设置权限数据
    setData,
    // 获取权限数据
    getData,
    // 获取页面权限数据
    getPageData,
    // 格式化权限按钮
    formatBtns,
    // 请求
    request,
}
