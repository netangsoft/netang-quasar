import {
    // 文件请求地址
    REQUEST_URL,
    UPLOAD_STATUS,
} from '../useUploader'

/**
 * 获取七牛云上传 token
 */
async function getQiniuToken(bucket = 'public') {

    // 请求数据
    const { status, data } = await utils.http({
        url: REQUEST_URL + 'get_qiniu_token',
        data: {
            bucket,
        },

        // 【生产模式】
        // --------------------------------------------------
        // #ifdef IS_PRO
        // 开启缓存
        cache: 'qiniu_token_' + bucket,
        // 缓存时间(6 小时)
        cacheTime: 21600000,
        // #endif
        // --------------------------------------------------
    })

    // 如果成功
    if (! status) {
        return false
    }

    return data
}

/**
 * 七牛云上传
 */
export default async function ({ waitUploadFileLists, uploadFileLists, checkFileError, setFileSuccess, setFileFail }) {

    // 获取七牛云上传 token
    const token = await getQiniuToken()
    if (! token) {
        for (const fileItem of waitUploadFileLists) {
            setFileFail(fileItem, '上传失败')
        }
        utils.toast({
            message: '获取上传参数失败',
        })
        return
    }

    // 批量上传
    for (const fileItem of waitUploadFileLists) {
        // 上传单个文件
        uploadFileItem(fileItem, token)
            .finally()
    }

    /**
     * 上传单个文件
     */
    async function uploadFileItem(fileItem, token) {

        // 设置文件状态
        fileItem.status = UPLOAD_STATUS.uploading

        // 请求上传文件到七牛云
        const { status, data: resUpload } = await utils.http({
            // 上传地址
            url: 'https://upload.qiniup.com/',
            // 数据
            data: {
                // 七牛云上传 token
                token,
                // 文件
                file: fileItem.file,
                // 自定义文件 key
                key: fileItem.hash,
            },
            // 关闭错误提醒
            warn: false,
            // 关闭检查结果 code
            checkCode: false,
            // 不包含头部鉴权认证
            token: false,
            // 开启上传
            upload: true,
            // 取消请求
            onCancel(cancel) {
                // 设置中断上传
                fileItem.abort = function(msg) {
                    cancel(utils.isValidString(msg) ? msg : '已取消')
                }
            },
            // 监听上传进度
            onUploadProgress(percent) {
                // 设置上传进度
                fileItem.progress = percent
            },
        })

        // 如果请求失败
        if (! status) {
            // 设置文件上传失败
            setFileFail(fileItem, resUpload.msg)
            return
        }

        // 如果检查七牛回调成功
        const query = await checkQiniuCallback(resUpload, fileItem)
        if (! query) {
            return
        }

        // 请求 - 上传文件至 cdn
        const { status: statusCallback, data: resCallback } = await utils.http({
            url: REQUEST_URL + 'upload_cdn_callback',
            data: query,
            // 关闭错误提示
            warn: false,
        })

        // 请求失败
        if (! statusCallback) {
            // 设置文件上传失败
            setFileFail(fileItem, resCallback.msg || '上传失败')
            return
        }

        // 设置文件上传成功
        setFileSuccess(fileItem)
    }

    /**
     * 检查七牛回调成功
     */
    function checkQiniuCallback(res, fileItem) {

        // 如果文件被删除
        if (_.findIndex(uploadFileLists.value, { hash: fileItem.hash }) === -1) {
            // 设置文件上传失败
            setFileFail(fileItem, '上传失败')
            return false
        }

        // 返回示例
        // ------------------------------
        // format: "null"
        // width: null
        // height: null
        // key: "d038dce5892840636b2c1f6d241f33ad"
        // hash: "lrYGlELBAgN9OgKV_i5gbHOdZMvt"
        // orientation: null
        // size: 6620454
        // aduration: 57.258005
        // vwidth: 1280
        // vheight: 720
        // vrotate: null
        // vduration: 57.291992

        const {
            format,
            width,
            height,
            key,
            orientation,
            size,
            aduration,
            vwidth,
            vheight,
            vrotate,
            vduration,
        } = res

        const query = {
            // 标题
            title: fileItem.title,
            // 类型(1:文件,2:图片,3:视频,4:音频)
            type: 0,
            // hash
            hash: key,
            // 文件大小
            size,
            // 后缀
            ext: fileItem.ext,
        }

        // json 信息
        const json = {}

        // 【1】先判断是否为视频(有时长 && 有宽 && 有高 && 时长 > 0, 则为视频)
        if (vduration && vwidth && vheight) {

            // 类型(3:视频)
            query.type = 3

            // 视频旋转角度
            // vrotate: 无  ==> 1: 手机右横屏(宽高不变)
            // vrotate: 90  ==> 2: 手机垂直(宽高反转)
            // vrotate: 180 ==> 3: 手机左横屏(宽高不变)
            // vrotate: 270 ==> 4: 手机倒过来垂直(宽高反转)
            const rotates = {
                90: 2,
                180: 3,
                270: 4,
            }

            // 设置 json 信息
            Object.assign(json, {
                w: vwidth,
                h: vheight,
                d: vduration,
            })

            if (_.has(rotates, vrotate)) {
                json.o = rotates[vrotate]
            }

        // 【2】再判断是否为音频(有音频时长 && 无视频时长 && 音频时长 > 0, 则为音频)
        } else if (aduration && ! vduration) {

            // 类型(4:音频)
            query.type = 4

            // 设置 json 信息
            json.d = aduration

        // 【3】再判断是否为图片(有宽 && 有高 && 大小 < 20M, 为图片)
        } else if (width && height) {

            // 类型(2:图片)
            query.type = 2

            // 图片后缀名
            query.ext = format === 'jpeg' ? 'jpg' : format

            // 如果大小 < 20M, 则为可用图片
            if (size < 20971520) {

                // 设置 json 数据
                json.w = width
                json.h = height

                // 图片垂直角度
                const orientations = {
                    // 【1】相机原始位置(宽高不变)
                    // 'top-left': 1,
                    // 【2】等于 1 的垂直镜像(几乎无用)(宽高不变)
                    'top-right': 2,
                    // 【3】旋转 180度(宽高不变)
                    'bottom-right': 3,
                    // 【4】等于 3 的垂直镜像(几乎无用)(宽高不变)
                    'bottom-left': 4,
                    // 【5】等于 8 的水平镜像(几乎无用)(宽高反转)
                    'left-top': 5,
                    // 【6】旋转 90 度(宽高反转)
                    'right-top': 6,
                    // 【7】等于 8 的垂直镜像(几乎无用)(宽高反转)
                    'right-bottom': 7,
                    // 【8】旋转 270 度(宽高反转)
                    'left-bottom': 8,
                }
                if (orientation && _.isString(orientation)) {
                    const key = _.trim(orientation).toLowerCase()
                    if (_.has(orientations, key)) {
                        json.o = orientations[key]
                    }
                }

            // 否则为类型为文件
            } else {
                // 检查文件错误
                const errMsg = checkFileError(query)
                if (errMsg) {
                    // 设置文件上传失败
                    setFileFail(fileItem, errMsg)
                    return false
                }

                // 类型(1:文件)
                query.type = 1
            }

        // 否则为类型为文件
        } else {
            // 类型(1:文件)
            query.type = 1
        }

        // 检查文件错误
        const errMsg = checkFileError(query)
        if (errMsg) {
            // 设置文件上传失败
            setFileFail(fileItem, errMsg)
            return false
        }

        // json 信息
        query.json = json

        // 设置文件
        Object.assign(fileItem, query)

        return Object.assign({}, query, {
            json: utils.isValidObject(json) ? JSON.stringify(json) : ''
        })
    }
}
