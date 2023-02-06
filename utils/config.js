import $n_get from 'lodash/get'
import $n_merge from 'lodash/merge'

// 配置
export const configs = {
    // api 请求公共数据地址
    apiDataUrl: '',
    // api 文件请求地址
    apiFileUrl: '',
    // 用户配置
    userConfig: {},
    // 用户字典
    userDict: {},
    // 字典变量
    dicts: {},
    // 自定义路由
    routers: {},
    // 表格配置
    tablesConfig: {},
    // 对话框组件
    dialogComponents: {},
    // 是否开启人民币分转元
    priceCentToYuan: false,
    // 上传器
    uploader: {
        upload: {},
        limit: {
            image: {
                maxSize: 10,
                exts: [ 'jpg', 'png', 'gif' ]
            }
        },
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
