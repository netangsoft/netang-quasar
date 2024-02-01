import $n_validator from '@netang/utils/validator'
import $n_storage from '@netang/utils/storage'

/**
 * 初始化鉴权状态
 */
export function initAuthStore() {
    // 获取管理员信息缓存
    const cache = $n_storage.get('_tk')
    return checkUserInfo(cache) ? cache : {
        id: 0,
        token: '',
        info: {},
        isLogin: false,
    }
}

/**
 * 验证用户信息
 */
export function checkUserInfo(data) {
    return ! $n_validator(data, {
        // 管理员 id
        id: 'required|natural_no_zero',
        // 鉴权认证
        token: 'required|string',
        // 用户信息
        info: 'required',
    })
}
