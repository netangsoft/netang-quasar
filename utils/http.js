import { isRef } from 'vue'
import axios from 'axios'
import createHttp from '@netang/utils/http'

/**
 * 初始化 http
 */
utils.http = createHttp({
    // 基础 url
    baseUrl: utils.config('apiUrl'),
    // 是否开启错误提醒(true:普通方式/false:不开启/alert:对话框方式)
    warn: 'alert',
    // 检查结果的 code 是否正确(前提数据类型必须为 json)
    checkCode: true,
    // 是否包含头部鉴权认证
    token: true,
    // 是否强制登录
    login: true,
    // 是否开启防抖(防止重复请求)
    debounce: true,
    // 缓存方法
    storage: utils.storage,
    // 是否已更新过鉴权
    _isUpdatedAuthToken: false,

    // 页面状态
    pageStatus: null,
    // 空状态描述
    emptyDescription: '',

    /**
     * 设置参数
     */
    onOptions({ options, para }) {

        // 取消请求
        if (_.isFunction(para.onCancel)) {
            const source = axios.CancelToken.source()
            options.cancelToken = source.token

            // 取消请求
            para.onCancel(function(msg) {
                // 取消请求
                source.cancel(msg)
            })
        }

        // 获取上传进度
        if (para.upload === true && _.isFunction(para.onUploadProgress)) {
            options.onUploadProgress = function (e) {
                para.onUploadProgress(Math.round(e.loaded * 100 / e.total), e)
            }
        }
    },

    /**
     * 处理请求
     */
    async onRequest({ options, para, onError, next }) {

        // 如果无网络
        // if (! utils.state.get('network').isOnline) {
        //     return onError({
        //         code: dicts.CODE__SERVER_ERROR,
        //         msg: '网络不给力，请检查设置后重试',
        //     })
        // }

        // const {
        //     // 应用版本名称
        //     appVersion,
        //     // 应用资源(wgt)的版本名称
        //     appWgtVersion,
        //     // 【自定义】app 类型(1:app-android,2:app-ios,3:web-mobile,4:web-pc)
        //     appType,
        // } = utils.getSystemInfo()

        // 如果验证 code, 说明是请求业务服务器
        if (para.checkCode) {

            // 加载设备信息
            // if (para.device) {
            //     Object.assign(options.headers, {
            //         // app 类型(1:app-android,2:app-ios,3:web-mobile,4:web-pc)
            //         Apptype: appType,
            //         // app 版本号
            //         Appversion: appVersion,
            //         // app wgt 版本号
            //         Appwgtversion: appWgtVersion,
            //     })
            // }

            // 如果需要头部鉴权
            if (para.token) {

                // 如果已登录
                if (utils.auth.isLogin()) {
                    const { token } = utils.auth.getAdminUserInfo()
                    options.headers.Authorization = token

                // 否则未登录 && 如果开启强制登录, 则跳转登录页面
                } else if (para.login) {
                    utils.auth.pushLogin()
                    return false
                }
            }
        }

        // 【调试模式】
        // --------------------------------------------------
        // #ifdef IS_DEBUG
            console.log('【请求 http】options', options)
        // #endif
        // --------------------------------------------------

        const res = await next(await axios(options))

        // 如果请求成功
        if (res.status && para.checkCode && para.token) {
            // 设置角色数据
            utils.$role.setData(_.get(res, 'response.data.role'))
        }

        return res
    },

    /**
     * 处理错误
     */
    onError({ data, para, r }) {

        if (para.upload === true && axios.isCancel(r)) {
            return {
                cancel: true,
                msg: r.message,
            }
        }

        // 【调试模式】
        // --------------------------------------------------
        // #if IS_DEBUG
            console.error('【请求错误 http error】', r?.response)
        // #endif
        // --------------------------------------------------

        // 如果开启错误提醒
        if (
            para.warn !== false
            && (
                data.code < dicts.CODE__BUSINESS_ERROR
                || data.code === dicts.CODE__SERVER_ERROR
            )
        ) {
            // 错误消息
            let message = data.msg

            // 【调试模式】
            // --------------------------------------------------
            // #if IS_DEBUG
            if (
                data.code === dicts.CODE__SERVER_ERROR
                && utils.isFillString(_.get(r, 'response.data'))
            ) {
                message = r.response.data
            }
            // #endif
            // --------------------------------------------------

            // 如果错误方式为提示框
            if (para.warn === 'alert') {

                // 提示框
                utils.alert({
                    message,

                    // #if IS_DEBUG
                    // --------------------------------------------------
                    style: 'width:80vw;max-width:80vw;',
                    html: true,
                    // #endif
                    // --------------------------------------------------

                })

            // 否则为轻提示
            } else {
                // 轻提示
                utils.toast({
                    message,

                    // #if IS_DEBUG
                    // --------------------------------------------------
                    html: true,
                    // #endif
                    // --------------------------------------------------
                })
            }
        }

        // 页面状态
        if (! _.isNil(para.pageStatus) && isRef(para.pageStatus)) {
            para.pageStatus.value = false
        }

        // 空状态描述
        if (! _.isNil(para.emptyDescription) && isRef(para.emptyDescription)) {
            para.emptyDescription.value = data.msg
        }
    },

    /**
     * 处理业务错误
     */
    async onBusinessError({ data, para, onHttp }) {

        if (utils.indexOf([
            // 状态码(411:强制退出)
            dicts.CODE__LOGOUT,
            // 状态码(410:token 过期需要重新鉴权)
            dicts.CODE__TOKEN_EXPIRED,
            // 状态码(412:当前用户账号被禁用，需要退出并重新跳转至登录页面)
            dicts.CODE__ACCOUNT_DISABLED,
            // 状态码(415:没有权限访问当前页面)
            dicts.CODE__NO_PERMISSION,

        ], data.code) > -1) {

            // 轻提示
            utils.toast({
                message: data.msg || '请重新登录',
            })

            // 退出登录
            utils.auth.logout()

            // 跳转登录页面
            utils.auth.pushLogin()

            return false
        }
    },
})
