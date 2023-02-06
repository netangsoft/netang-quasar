import $n_get from 'lodash/get'
import $n_merge from 'lodash/merge'

// 配置
export const configs = {
    // 用户配置
    userConfig: {},
    // 用户字典
    userDict: {},
    // 请求公共数据地址
    commonDataUrl: '',
    // 上传器
    uploader: {
        upload: {},
        limit: {},
    },
}

/**
 * 配置处理器
 * @param options
 */
export function configHandler(options) {
    $n_merge(configs, options)
}

/**
 * 获取配置
 */
export default function config(key = '', defaultValue = '') {
    return key ? $n_get(configs.userConfig, key, defaultValue) : configs.userConfig
}
