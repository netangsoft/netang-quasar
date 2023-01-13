/**
 * 初始化鉴权状态
 */
export function initAuthStore() {
    // 获取管理员信息缓存
    const cache = utils.cookie.get('_tk')
    return checkAdminUserInfo(cache) ? cache : {
        id: 0,
        isLogin: false,
        info: {},
    }
}

/**
 * 验证管理员信息
 */
export function checkAdminUserInfo(data) {
    return ! utils.validator(data, {
        // 管理员 id
        id: 'required|natural_no_zero',
        // 登录 token
        token: 'required|string',
        // 管理员信息
        info: 'required',
    })
}
