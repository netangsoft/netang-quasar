import $n_router from '@netang/vue-utils/router'

import $n_isValidObject from '@netang/utils/isValidObject'
import $n_cookie from '@netang/utils/cookie'

import { stateUserInfo } from '../store'
import { checkUserInfo } from './useAuth'

/**
 * 是否登录
 */
function isLogin() {
    return stateUserInfo.value.isLogin
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
        // 用户基础信息
        user_info,
    } = res

    // 更新用户信息
    return _updateUserInfo({
        id: i,
        token: t,
        info: $n_isValidObject(user_info) ? user_info : {},
    })
}

/**
 * 更新用户信息
 */
function updateUserInfo(res) {
    return _updateUserInfo(Object.assign(
        {},
        stateUserInfo.value,
        res,
    ))
}
function _updateUserInfo(res) {

    // 验证用户信息
    if (! checkUserInfo(res)) {

        // 【调试模式】
        // --------------------------------------------------
        // #ifdef IS_DEBUG
        console.error('【验证错误 _updateUserInfo】', res)
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

    // 设置用户信息状态
    stateUserInfo.value = res

    return true
}

/**
 * 获取用户信息
 */
function getUserInfo() {
    return stateUserInfo.value
}

/**
 * 获取用户 id
 */
function getAdminUserId() {
    return isLogin() ? stateUserInfo.value.id : 0
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

    // 清空用户信息状态
    stateUserInfo.value = {
        id: 0,
        isLogin: false,
        info: {},
    }
}

/**
 * 鉴权业务
 */
const $auth = {
    // 是否登录
    isLogin,
    // 登录后更新数据
    updateLogin,
    // 更新用户信息
    updateUserInfo,
    // 获取用户信息
    getUserInfo,
    // 获取管理员 id
    getAdminUserId,
    // 跳转登录页面
    pushLogin,
    // 退出登录
    logout,
}

export default $auth
