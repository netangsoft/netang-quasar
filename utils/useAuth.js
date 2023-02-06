import validator from '@netang/utils/validator'
import $n_cookie from '@netang/utils/cookie'

const {
    validator: $n_validator,
} = validator

/**
 * 初始化鉴权状态
 */
export function initAuthStore() {
    // 获取管理员信息缓存
    const cache = $n_cookie.get('_tk')
    return checkUserInfo(cache) ? cache : {
        id: 0,
        isLogin: false,
        info: {},
    }
}

/**
 * 验证用户信息
 */
export function checkUserInfo(data) {
    return ! $n_validator(data, {
        // 管理员 id
        id: 'required|natural_no_zero',
        // 登录 token
        token: 'required|string',
        // 管理员信息
        info: 'required',
    })
}
