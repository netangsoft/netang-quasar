/**
 * 文件请求地址
 */
export const REQUEST_URL = 'system/file/index?call='

/**
 * 文件类型映射
 */
export const FilE_TYPE = {
    file: 1,
    image: 2,
    video: 3,
    audio: 4,
}

/**
 * 文件名称映射
 */
export const FilE_NAME = {
    1: '文件',
    2: '图片',
    3: '视频',
    4: '音频',
}

/**
 * 上传状态
 */
export const UPLOAD_STATUS = {
    // 等待上传中
    waiting: 1,
    // 检查 hash 中
    hashChecking: 2,
    // 检查 hash 完成
    hashChecked: 3,
    // 检查是否存在服务器中
    existChecking: 4,
    // 检查是否存在服务器完成
    existChecked: 5,
    // 上传中
    uploading: 6,
    // 上传完成
    success: 7,
    // 上传失败
    fail: 8,
}

/**
 * 上传器
 */
export const UPLOADERS = {
    // 本地上传
    'local': ()=>import('./uploader/uploader/local'),
    // 七牛云上传
    'qiniu': ()=>import('./uploader/uploader/qiniu'),
    // 阿里云上传
    'aliyun': ()=>import('./uploader/uploader/aliyun'),
}
