import $n_get from 'lodash/get'

// 用户配置 参数
// userConfig: {
//     // api 请求公共数据地址
//     apiDataUrl: '',
//     // api 文件请求地址
//     apiFileUrl: '',
//     // api 请求权限标识
//     apiDataPowerName: '',
//     // 是否开启人民币分转元
//     priceCentToYuan: false,
//     // 上传器
//     uploader: {
//         upload: {
//             type: '',
//             domain: '',
//         },
//     },
// },

// 配置
export const configs = {
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
    // 格式化上传文件 hash
    formatUploadFileHash: null,
    // 获取文件地址
    getFileUrl: null,
}

/**
 * 配置设置
 * @param options
 */
export function settings(options) {
    Object.assign(configs, options)
}

/**
 * 获取配置
 */
export default function config(key = '', defaultValue = '') {
    return key ? $n_get(configs.userConfig, key, defaultValue) : configs.userConfig
}
