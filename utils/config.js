import $n_get from 'lodash/get'
import $n_merge from 'lodash/merge'

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
//     uploader: {},
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
    // 组件配置
    components: {},
    // 对话框组件
    dialogComponents: {},
    power: {
        // 确认密码
        confirmPassword: null,
    },
    // 上传器配置
    uploader: {
        // 如果是 Minio 上传, 则在后面加上下划线
        hasMinioSuffix: true,
        // minio 文件标签
        minioFileTag: '私',
        // 格式化上传文件 hash
        formatUploadFileHash: null,
        // 格式化上传网络链接
        formatUploadNet: null,
        // 获取文件地址
        getFileUrl: null,
        // 上传请求
        onUploadHttp: null,
    },
    // 鉴权过期时间(2 天)
    authExpireTime: 172800000,
}

/**
 * 配置设置
 * @param options
 */
export function settings(options) {
    $n_merge(configs, options)
}

/**
 * 获取配置
 */
export default function config(key = '', defaultValue = '') {
    return key ? $n_get(configs.userConfig, key, defaultValue) : configs.userConfig
}
