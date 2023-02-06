import $n_router from '@netang/vue-utils/router'
import $n_isValidObject from '@netang/utils/isValidObject'
import $n_cookie from '@netang/utils/cookie'

import { stateAdminUserInfo } from '../store'
import { checkAdminUserInfo } from './useAuth'

/**
 * 是否登录
 */
function isLogin() {
    return stateAdminUserInfo.value.isLogin
}

/**
 * 登录后更新数据
 */
function updateLogin(res) {

    // 获取返回结果
    const {
        // 管理员 id
        i,
        // 鉴权认证
        t,
        // 管理员基础信息
        admin_user_info,
    } = res

    // 更新管理员信息
    return _updateAdminUserInfo({
        id: i,
        token: t,
        info: $n_isValidObject(admin_user_info) ? admin_user_info : {},
    })
}

/**
 * 更新管理员信息
 */
function updateAdminUserInfo(res) {
    return _updateAdminUserInfo(Object.assign(
        {},
        stateAdminUserInfo.value,
        res,
    ))
}
function _updateAdminUserInfo(res) {

    // 验证管理员信息
    if (! checkAdminUserInfo(res)) {

        // 【调试模式】
        // --------------------------------------------------
        // #ifdef IS_DEBUG
        console.error('【验证错误 _updateAdminUserInfo】', res)
        // #endif
        // --------------------------------------------------

        return false
    }

    // 设置已登录
    res.isLogin = true

    if (! $n_isValidObject(res.info)) {
        res.info = {}
    }

    // 保存缓存(永久缓存)
    $n_cookie.set('_tk', res, 0)

    // 设置管理员信息状态
    stateAdminUserInfo.value = res

    return true
}

/**
 * 获取管理员数据
 */
function getAdminUserInfo() {
    return stateAdminUserInfo.value
}

/**
 * 获取管理员 id
 */
function getAdminUserId() {
    return isLogin() ? stateAdminUserInfo.value.id : 0
}

/**
 * 跳转登录页面
 */
function pushLogin(query) {
    $n_router.push({
        path: 'login',
        query,
    })
}

/**
 * 退出登录
 */
function logout() {

    // 删除管理员信息
    $n_cookie.delete('_tk')

    // 清空管理员信息状态
    stateAdminUserInfo.value = {
        id: 0,
        isLogin: false,
        info: {},
    }
}

/**
 * 鉴权业务
 */
const auth = {
    // 是否登录
    isLogin,
    // 登录后更新数据
    updateLogin,
    // 更新管理员信息
    updateAdminUserInfo,
    // 获取管理员数据
    getAdminUserInfo,
    // 获取管理员 id
    getAdminUserId,
    // 跳转登录页面
    pushLogin,
    // 退出登录
    logout,
}

export default auth
