import $n_has from 'lodash/has'

import $n_storage from '@netang/utils/storage'
import $n_isValidObject from '@netang/utils/isValidObject'
import $n_isValidString from '@netang/utils/isValidString'
import $n_http from '@netang/utils/http'
import $n_numberDeep from '@netang/utils/numberDeep'
import $n_json from '@netang/utils/json'

import { getUpload } from './uploader'

import $n_toast from './toast'
import $n_config from './config'

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
 * 获取单个文件 hash
 */
export function getFileItemHash(hash, configUpload) {
    if (configUpload.type === 'minio') {
        return hash + '_'
    }
    return hash
}

/**
 * 获取图片信息
 */
async function getImageInfo(fileItem) {
    return new Promise(function (resolve) {
        const img = new Image()
        img.src = window.URL.createObjectURL(fileItem.file)
        fileItem.__img = img.src
        img.onload = function() {
            fileItem.json = {
                w: this.naturalWidth,
                h: this.naturalHeight,
            }
            resolve(true)
        }
        img.onerror = function() {
            resolve(false)
        }
    })
}

/**
 * 获取媒体信息
 */
async function getMediaInfo(fileItem, type) {
    return new Promise(function (resolve) {
        const dom = document.createElement(type)
        dom.src = URL.createObjectURL(fileItem.file)
        dom.onloadedmetadata = function() {
            fileItem.json = {
                d: this.duration,
            }
            if (type === 'video') {
                Object.assign(fileItem.json, {
                    w: this.videoWidth,
                    h: this.videoHeight,
                })
            }
            resolve(true)
        }
        if (type === 'video') {
            dom.currentTime = 3
            dom.oncanplay = function() {
                const width = this.videoWidth ? this.videoWidth : this.width
                const height = this.videoHeight ? this.videoHeight : this.height
                const duration = this.duration

                const canvas = document.createElement('canvas')
                const ctx = canvas.getContext('2d')

                canvas.setAttribute('width',width)
                canvas.setAttribute('height',height)
                ctx.drawImage(dom, 0, 0, width, height)
                const imgSrc = canvas.toDataURL('image/png')

                console.log('------imgSrc', imgSrc)
            }
        }
        dom.onerror = function() {
            resolve(false)
        }
    })
}

/**
 * 设置单个文件信息
 */
export function setFileItemInfo(fileItem, setFileFail) {
    return new Promise(async function (resolve) {

        // 如果已经设置过了
        if (
            $n_has(fileItem.json, 'w')
            || $n_has(fileItem.json, 'd')
        ) {
            resolve(true)
            return
        }

        let res

        // 如果为图片
        // --------------------------------------------------
        if (fileItem.type === 2) {
            res = await getImageInfo(fileItem)

            // 如果为视频
            // --------------------------------------------------
        } else if (fileItem.type === 3) {
            res = await getMediaInfo(fileItem, 'video')

            // 如果为音频
            // --------------------------------------------------
        } else if (fileItem.type === 4) {
            res = await getMediaInfo(fileItem, 'audio')

            // 否则为文件
        } else {
            // 先判断是否为图片
            res = await getImageInfo(fileItem)
            if (! res) {
                // 再判断是否为视频
                res = await getMediaInfo(fileItem, 'video')
                if (! res) {
                    // 最后再判断是否为音频
                    res = await getMediaInfo(fileItem, 'video')
                }
            }
        }
        // --------------------------------------------------

        if (res) {
            resolve(true)
        } else {
            // 设置文件上传失败
            setFileFail(fileItem)
            resolve(false)
        }
    })
}

/**
 * 获取上传参数
 */
export async function getUploadParams(type, bucket = 'public') {

    // 缓存名
    const cacheName = `upload_params_${type}_${bucket}`

    // 获取缓存
    const cache = $n_storage.get(cacheName)
    if (cache !== null) {
        return cache
    }

    // 请求数据
    const { status, data } = await $n_http({
        url: $n_config('apiFileUrl') + 'get_upload_params',
        data: {
            // 类型
            type,
            // 空间名称
            bucket,
        },
    })

    // 如果成功
    if (! status || ! $n_isValidObject(data)) {
        return false
    }

    // 【生产模式】
    // --------------------------------------------------
    // #ifdef IS_PRO
    // 保存缓存(6 小时)
    $n_storage.set(cacheName, data, 21600000)
    // #endif
    // --------------------------------------------------

    return data
}

/**
 * 删除上传参数缓存
 */
export function deleteUploadParams(type, bucket = 'public') {
    $n_storage.delete(`upload_params_${type}_${bucket}`)
}

/**
 * 上传至服务器
 */
export async function uploadServer(params) {

    const {
        fileType,
        configUpload,
        waitUploadFileLists,
        // uploadFileLists,
        // checkFileError,
        setFileSuccess,
        setFileFail,
    } = params

    // 获取上传参数
    const uploadParams = await getUploadParams(configUpload.type)
    if (uploadParams === false) {
        for (const fileItem of waitUploadFileLists) {
            setFileFail(fileItem, '上传失败')
        }
        $n_toast({
            message: `获取[${configUpload.type}]上传参数失败`,
        })
        return
    }

    // 是否上传 minio 备份
    // --------------------------------------------------
    let backupParams = null
    let backupConfig = null
    if (configUpload.type !== 'minio') {
        backupConfig = getUpload(null, 'minio')
        // 如果同步
        if (backupConfig.sync === true) {
            backupParams = await getUploadParams(backupConfig.type)
            if (backupParams === false) {
                for (const fileItem of waitUploadFileLists) {
                    setFileFail(fileItem, '上传失败')
                }
                $n_toast({
                    message: `获取[${backupConfig.type}]上传参数失败`,
                })
                return
            }
        }
    }
    // --------------------------------------------------

    // 批量上传
    for (const fileItem of waitUploadFileLists) {
        // 上传单个文件
        await uploadFileItem(fileItem)
    }

    /**
     * 上传单个文件
     */
    async function uploadFileItem(fileItem) {

        // 设置文件状态
        fileItem.status = UPLOAD_STATUS.uploading

        // 上传文件
        const upload = async function(configUpload, uploadParams, startPercent, halfPercent) {

            const {
                // 上传地址
                url,
                // 文件名
                fileName,
                // 键值名
                keyName,
                // 上传数据
                data,
            } = uploadParams

            // 请求数据
            const httpData = Object.assign({}, data)
            // 文件
            httpData[fileName] = fileItem.file
            // 自定义文件 key
            httpData[keyName] = fileItem.hash

            const { status, data: res } = await $n_http({
                // 上传地址
                url,
                // 数据
                data: httpData,
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
                        cancel($n_isValidString(msg) ? msg : '已取消')
                    }
                },
                // 监听上传进度
                onUploadProgress(percent) {
                    // 设置上传进度
                    fileItem.progress = Math.round(startPercent + (halfPercent ? percent / 2 : percent))
                },
            })

            // 如果请求失败
            if (! status) {
                // 设置文件上传失败
                setFileFail(fileItem, res.msg)
                // 删除上传参数缓存
                deleteUploadParams(configUpload.type)
                return false
            }

            return res
        }

        const resUpload = await upload(configUpload, uploadParams, 0, !! backupParams)
        if (resUpload === false) {
            return false
        }

        // 是否已备份
        let is_backup = 0

        // 上传至备份服务器
        // --------------------------------------------------
        if (backupParams) {
            const res = await upload(backupConfig, backupParams, 50, true)
            if (res === false) {
                return false
            }
            is_backup = 1
        }
        // --------------------------------------------------

        const {
            title,
            type,
            hash,
            ext,
            size,
            json,
        } = fileItem

        // 请求数据
        const data = {
            // 类型
            type: configUpload.type,
            // 需上传的文件类型
            file_type: fileType,
            // 文件
            file: {
                // 标题
                title: title || '',
                // 类型
                type,
                // hash
                hash,
                // 后缀
                ext,
                // 文件大小
                size,
                // 文件 json
                json,
                // 是否已备份
                is_backup,
            },
            // 结果
            result: $n_isValidObject(resUpload) ? resUpload : {},
        }

        // 请求 - 上传文件至 cdn
        const { status: statusCallback, data: resCallback } = await $n_http({
            url: $n_config('apiFileUrl') + 'upload_callback',
            data,
            // 关闭错误提示
            warn: false,
        })

        // 请求失败
        if (! statusCallback || ! $n_isValidObject(resCallback)) {
            // 设置文件上传失败
            setFileFail(fileItem, resCallback.msg || '上传失败')
            return false
        }

        // 格式化 json
        const _json = $n_json.parse(resCallback.json)
        Object.assign(fileItem, resCallback, {
            json: $n_isValidObject(_json) ? $n_numberDeep(_json) : {},
        })

        // 设置文件上传成功
        setFileSuccess(fileItem)

        return true
    }
}
