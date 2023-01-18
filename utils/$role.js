import { isRef } from 'vue'
import { useRoute } from 'vue-router'

import { stateRole } from '../store'

/**
 * 设置角色数据
 */
function setData(data) {

    // 如果没有角色数据
    if (! utils.isFillObject(data)) {
        return
    }

    const {
        rows,
        v,
    } = data

    if (! utils.isFillArray(rows) || ! v) {
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
            item.data = utils.json.parse(item.data)
        }
        item.data = utils.isFillObject(item.data) ? utils.numberDeep(item.data) : {}

        // 设置数据类型
        item.data.type = item.data_type
        delete item.data_type

        // 标识
        item.name = ''

        // 如果有 url
        if (utils.isFillString(item.url)) {

            // url 首位加上反斜杠
            item.url = utils.slash(_.toLower(utils.trimString(item.url)), 'start', true)
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
        if (_.has(item.data, 'toPage')) {
            // 设置跳转页面地址
            item.data.toPage = _.has(all, item.data.toPage) ? all[item.data.toPage].data.url : null

        // 如果有请求成功执行类型
        } else if (_.has(item.data, 'requestSuccess.type')) {
            // 如果请求成功执行类型是关闭窗口、跳转并刷新页面
            if (item.data.requestSuccess.type === 'closePushRefresh') {
                // 设置刷新页面地址
                item.data.requestSuccess.params =
                    (
                        // 如果有刷新页面的参数 id
                        _.has(item.data.requestSuccess, 'params')
                        // 如果有页面数据
                        && _.has(all, item.data.requestSuccess.params)
                    ) ? all[item.data.requestSuccess.params].data.url : null
            }
        }

        if (
            // 数据/按钮
            item.type > 1
            // 有父级数据
            && _.has(all, item.pid)
        ) {
            const pItem = all[item.pid]
            if (_.has(btns, pItem.url)) {
                btns[pItem.url].push(item)
            } else {
                btns[pItem.url] = [item]
            }
        }
    }

    // 保存至状态中
    stateRole.value = {
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
 * 获取管理端角色权限数据
 */
async function getData() {

    // 如果没有管理端角色权限数据
    if (! stateRole.value.v) {

        // 获取管理端角色权限数据
        const res = await utils.getData(utils.config('rolePowerName'))
        if (res === false) {
            stateRole.value = {
                // 角色权限版本
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
            return utils.fail()
        }
    }

    // 如果有角色状态数据, 则直接返回
    if (stateRole.value.v) {
        return utils.success(_.cloneDeep(stateRole.value))
    }

    return utils.fail()
}

/**
 * 解析传参
 */
function parseQuery(data, settings) {

    // 如果配置是字符串
    if (utils.isFillString(settings)) {

        // 如果返回所有传参
        if (settings === 'all') {
            return utils.isFillObject(data) ? data : {}
        }

        // 将字符串放到数组中
        settings = [settings]

    // 如果配置是对象
    } else if (utils.isFillObject(settings)) {
        settings = [settings]
    }

    const query = {}

    // 如果配置是数组
    if (utils.isFillArray(settings)) {

        // 别名
        const alias = {}

        for (let item of settings) {
            // 如果是需要的字段
            if (utils.isFillString(item)) {

                // 将字段转小写
                item = _.toLower(utils.trimString(item))

                // 判断字段是否有 as 别名
                const arr = utils.split(item, ' as ')

                // 如果有别名
                if (arr.length === 2) {
                    alias[utils.trimString(arr[0])] = utils.trimString(arr[1])

                // 否则别名就是当前字段本身
                } else {
                    alias[item] = item
                }

            // 否则如果是自定义传参
            } else if (utils.isFillObject(item)) {
                Object.assign(query, item)
            }
        }

        if (
            // 如果有参数数据
            utils.isFillObject(data)
            // 如果有定义别名
            && utils.isFillObject(alias)
        ) {
            utils.forIn(data, function(value, key) {

                // 如果当前字段在别名中
                if (_.has(alias, key)) {
                    query[alias[key]] = value
                }
            })
        }
    }

    return query
}

/**
 * 格式化权限按钮列表
 */
function formatRoleBtnLists(roleBtnLists, filterBtns, toObject = false) {

    const newLists = []

    utils.forEach(roleBtnLists, function(item) {

        const {
            name,
            icon,
        } = item

        const newItem = Object.assign({}, item, {
            // 图标
            icon: icon || undefined,
            // 隐藏按钮
            hidden: _.get(item, 'hidden') === true,
            // 显示按钮类型
            show: _.has(item, 'data.show') ? item.data.show : true,
        })

        // 是否固定按钮
        newItem.fixed =
            // 非隐藏按钮
            ! newItem.hidden
            // 固定列
            && _.get(newItem, 'data.fixed') === true
            // 单个按钮
            && newItem.show === 'single'
            // 按钮有图标
            && !! newItem.icon

        // 如果是对象
        if (utils.isFillObject(filterBtns)) {
            if (_.has(filterBtns, name)) {
                newLists.push(_.merge(newItem, filterBtns[name]))
            }

        // 如果是数组
        } else if (utils.isFillArray(filterBtns)) {
            if (utils.indexOf(filterBtns, name) > -1) {
                newLists.push(_.merge(newItem, filterBtns[name]))
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
    if (_.has(o.data, 'requestQuery.query')) {
        const resQuery = parseQuery(o.query, o.data.requestQuery.query)
        if (utils.isFillObject(resQuery)) {
            Object.assign(query, resQuery)
        }
    }

    // 获取表格数据
    if (
        // 如果按钮参数有显示类型
        _.has(o.data, 'show')
        // 按钮参数的显示类型必须是单选或多选
        && utils.indexOf(['single', 'multi'], o.data.show) > -1
        // 如果有请求传参的表格设置
        && _.has(o.data, 'requestQuery.table')
        // 如果有表格数据
        && utils.isFillArray(o.tableSelected)
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
                utils.forIn(item, function(value, key) {
                    if (_.has(newQuery, key)) {
                        newQuery[key].push(value)
                    } else {
                        newQuery[key] = [value]
                    }
                })
            }
        }

        const resTable = parseQuery(newQuery, o.data.requestQuery.table)
        if (utils.isFillObject(resTable)) {
            Object.assign(query, resTable)
        }
    }

    return _.merge({}, query)
}

/**
 * 格式化参数
 */
function formatQuery(query, isJoinArr) {

    const newQuery = {}

    // 格式化参数
    utils.forIn(query, function(value, key) {

        // 如果是数字
        if (utils.isNumeric(value)) {
            newQuery[key] = _.isNumber(value) ? value : Number(value)

        // 如果是字符串
        } else if (utils.isFillString(value)) {
            newQuery[key] = utils.trimString(value)

        // 如果是数组
        } else if (utils.isFillArray(value)) {
            const arr = []
            for (const val of value) {
                // 如果是数字
                if (utils.isNumeric(val)) {
                    arr.push(_.isNumber(val) ? val : Number(val))

                // 如果是字符串
                } else if (utils.isFillString(val)) {
                    arr.push(utils.trimString(val))
                }
            }
            if (arr.length) {
                newQuery[key] = isJoinArr ? utils.join(arr, ',') : arr
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
    const o = _.merge({
        // 按钮数据
        data: {},
        // 参数
        query: {},
        // 布局数据
        layoutData: {},
        // 表格选中数据
        tableSelected: [],
        // 表格刷新
        tableRefresh: null,
        // 检查是否正在上传文件
        checkUploading: null,
        // 表单节点
        formRef: null,
        // 表单数据
        formData: null,
        // 重置表单
        resetForm: null,
        // 请求前执行
        requestBefore: null,
        // 请求成功执行
        requestSuccess: null,
        // 请求失败执行
        requestFail: null,
        // 请求后执行
        requestAfter: null,
    }, params)

    // 判断类型
    if (! _.get(o.data, 'type')) {

        // 【调试模式】
        // --------------------------------------------------
        // #ifdef IS_DEBUG
        console.log('没有定义数据类型')
        // #endif
        // --------------------------------------------------

        return
    }

    // 判断 url
    o.data.url = _.toLower(utils.trimString(o.data.url))
    if (! o.data.url) {

        if (
            // 如果没有跳转页面地址
            ! _.has(o.data, 'toPage')
            // 或跳转页面地址为空
            || ! utils.isFillString(o.data.toPage)
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
    const query = getRequestQuery(o)

    // 如果是打开新窗口
    // --------------------------------------------------
    if (o.data.type === dicts.POWER_DATA_TYPE__OPEN) {

        // 请求前执行
        if (await utils.runAsync(o.requestBefore)({ params: o, requestData: query }) === false) {
            return
        }

        utils.router.push({
            path: o.data.url,
            query: formatQuery(query, true),
        })
        return
    }

    // 请求数据
    let requestData = {}

    // 如果是提交表单
    // --------------------------------------------------
    if (o.data.type === dicts.POWER_DATA_TYPE__FORM) {

        // 如果验证表单
        if (_.get(o.data, 'validate') !== false) {

            let formRef
            if (o.formRef) {
                if (isRef(o.formRef)) {
                    formRef = o.formRef.value
                } else if (_.isFunction(o.formRef)) {
                    formRef = o.formRef()
                } else {
                    formRef = o.formRef
                }
            }

            // 如果没有绑定表单节点
            if (! formRef) {

                // 【调试模式】
                // --------------------------------------------------
                // #ifdef IS_DEBUG
                console.log('没有绑定 fromRef')
                // #endif
                // --------------------------------------------------

                return
            }

            // 验证表单
            if (! await formRef.validate()) {
                return
            }
        }

        // 判断表单数据
        if (! utils.isFillObject(o.formData)) {

            // 【调试模式】
            // --------------------------------------------------
            // #ifdef IS_DEBUG
            console.log('没有获取到表单数据')
            // #endif
            // --------------------------------------------------

            return
        }

        // 检查是否正在上传文件
        if (_.isFunction(o.checkUploading) && o.checkUploading()) {
            // 轻提示
            utils.toast({
                message: '文件上传中，请耐心等待',
            })
            return
        }

        // 获取请求数据
        requestData = _.merge({}, formatQuery(query, false), o.formData)

    // 如果是请求数据
    // --------------------------------------------------
    } else {
        // 获取请求数据
        requestData = formatQuery(query, false)
    }

    // 判断是否有确认框
    const isConfirm = _.get(o.data, 'confirm')
    if (
        // 如果有确认框
        isConfirm
        // 如果有密码确认框
        || _.get(o.data, 'confirmPassword')
    ) {
        // 如果需要先弹出确认框
        if (isConfirm) {

            // 确认框
            utils.confirm({
                // 重要操作，请输入登录密码并确认后操作
                message: utils.isFillString(isConfirm) ? isConfirm : '确认要执行该操作吗？',
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
        if (await utils.runAsync(o.requestBefore)({ params: o, requestData }) === false) {
            return
        }

        // 请求
        const res = await utils.http({
            // 请求地址
            url: o.data.url,
            // 请求数据
            data: requestData,
        })

        // 返回结果数据
        const resultData = Object.assign({}, res, {
            params: o,
            requestData,
        })

        // 如果请求成功
        if (res.status) {

            // 下一步
            function next() {

                // 轻提示
                utils.toast({
                    type: 'positive',
                    message: '恭喜您，操作成功',
                })

                // 判断是否有请求成功后的操作动作
                if (_.has(o.data, 'requestSuccess.type')) {
                    switch (o.data.requestSuccess.type) {

                        // 关闭当前页面
                        case 'close':
                        // 关闭窗口并跳转页面
                        case 'closePush':
                        // 关闭窗口、跳转并刷新页面
                        case 'closePushRefresh':

                            const opts = {
                                type: 'closeCurrentTab',
                            }

                            // 如果不是关闭当前页面, 则为关闭窗口并跳转页面
                            if (o.data.requestSuccess.type !== 'close') {
                                Object.assign(opts, {
                                    // 跳转页面地址
                                    pushPage: o.data.requestSuccess.params,
                                    // 是否跳转并刷新页面
                                    isPushRefresh: o.data.requestSuccess.type === 'closePushRefresh',
                                })
                            }

                            // 关闭当前标签页
                            utils.bus.emit('main', opts)
                            break

                        // 重置表单
                        case 'resetForm':
                            utils.run(o.resetForm)()
                            break

                        // 刷新表格
                        case 'refreshTable':
                            utils.run(o.tableRefresh)()
                            break
                    }
                }
            }

            // 请求成功执行
            const res = await utils.runAsync(o.requestSuccess)(Object.assign({ next }, resultData))
            if (res === false) {
                return
            }

            // 下一步
            next()

        } else {
            // 请求失败执行
            utils.run(o.requestFail)(resultData)
        }

        // 请求后执行
        utils.run(o.requestAfter)(resultData)
    }
}

/**
 * 获取当前页面角色权限
 */
async function getPageData($route, pageStatus, emptyDescription, roleBtnLists) {

    if (! $route) {
        $route = useRoute()
    }

    function fail(message) {

        if (! _.isNil(pageStatus) && isRef(pageStatus)) {
            pageStatus.value = false
        }

        if (! _.isNil(emptyDescription) && isRef(emptyDescription)) {
            emptyDescription.value = message

        } else {
            // 提示框
            utils.alert({
                message,
            })
        }
        return false
    }

    const path = _.get($route, 'path')
    if (! path) {
        return fail('路由参数错误')
    }

    // 获取角色数据
    const { status, data: { urls, btns } } = await utils.$role.getData()
    if (! status || ! _.has(urls, path)) {
        return fail('该页面没有权限')
    }

    // 设置权限按钮列表
    const roleBtns = _.has(btns, path) ? btns[path] : []
    if (! _.isNil(roleBtnLists) && isRef(roleBtnLists)) {
        roleBtnLists.value = roleBtns
    }

    return {
        page: urls[path],
        btns: roleBtns,
    }
}

/**
 * 角色业务
 */
utils.$role = {
    // 设置角色数据
    setData,
    // 获取角色数据
    getData,
    // 获取页面角色数据
    getPageData,
    // 格式化权限按钮列表
    formatRoleBtnLists,
    // 请求
    request,
}
