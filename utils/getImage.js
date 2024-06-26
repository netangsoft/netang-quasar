import $n_get from 'lodash/get'
import $n_has from 'lodash/has'
import $n_isString from 'lodash/isString'

import $n_isValidArray from '@netang/utils/isValidArray'
import $n_isValidObject from '@netang/utils/isValidObject'
import $n_isValidString from '@netang/utils/isValidString'
import $n_isNumeric from '@netang/utils/isNumeric'
import $n_split from '@netang/utils/split'
import $n_slash from '@netang/utils/slash'

import $n_uploader from './uploader'

import useFileUrl from './useFileUrl'

/**
 * 像素转数字
 */
function px2Number(w) {

    if ($n_isString(w)) {
        w = w.replace('px', '')
    }

    if ($n_isNumeric(w)) {
        w = Number(w)
        if (w > 0) {
            return w
        }
    }

    return 0
}

/**
 * 获取宽度
 */
function getW(options) {

    // 如果有真实宽度
    if (
        $n_has(options, 'realWidth')
        && $n_isNumeric(options.realWidth)
    ) {
        const realWidth = px2Number(options.realWidth)
        return realWidth > 0 ? realWidth : 0
    }

    if (
        $n_has(options, 'w')
        && $n_isNumeric(options.w)
    ) {
        const w = px2Number(options.w)
        return w > 0 ? w : 0
    }

    return null
}

/**
 * 获取图片
 */
export default function getImage(src, options) {

    if (src) {

        // 如果为数组, 则获取第一个
        if ($n_isValidArray(src)) {
            src = src[0]
        }

        // 如果为对象
        if ($n_isValidObject(src)) {

            if ($n_has(src, 'options')) {
                options = src.options
            }

            if ($n_has(src, 'img')) {
                src = src.img
            }
        }

        // 如果是字符串
        if ($n_isValidString(src)) {

            // data: 或 blob: 开头的地址
            if (/^(data:|blob:)/i.test(src)) {
                return src
            }

            // 如果是 http(s):// 开头
            if (/^(http(s)?:\/\/)/i.test(src)) {
                src = $n_split(
                    src.replace(/,https:\/\//gi, '___https://')
                        .replace(/,http:\/\//gi, '___http://')
                    , '___'
                )

            // 否则则按照逗号隔开转为数组
            } else {
                src = $n_split(src, ',')
            }

            // 如果为数组, 则获取第一个
            if ($n_isValidArray(src)) {
                src = src[0]
            }

            // http(s):// 开头的地址
            // /^(http(s)?:\/\/|data:|blob:)/i.test(src)
            if (/^(http(s)?:\/\/)/i.test(src)) {
                return src
            }

            // 如果为对象定义的规格
            if ($n_isValidObject(options)) {

                // 获取宽度
                let w = getW(options)
                if (w) {

                    let {
                        maxWidth,
                        zoom,
                    } = options

                    /* #if IS_WEB */
                    // 如果开启缩放
                    if (
                        zoom
                        // 获取设备像素比
                        && window.devicePixelRatio >= 2
                    ) {
                        // w *= (devicePixelRatio > 3 ? 3 : devicePixelRatio)
                        w *= 2
                    }
                    /* #endif */

                    w = Math.floor(w)

                    // 如果有最大宽度
                    if (maxWidth && w > maxWidth) {
                        w = maxWidth
                    }

                    options.w = w

                // 否则如果无宽度
                } else if (w === 0) {
                    options.w = 0

                // 否则删除宽度
                } else if ($n_has(options, 'w')) {
                    delete options.w
                }

            } else {
                options = {}
            }

            const {
                type,
                domain,
            } = $n_uploader.getUpload(
                null,
                $n_has(options, 'upload')
                    ? options.upload
                    : (
                        src && src.slice(-1) === '_'
                            ? 'minio'
                            : ''
                    )
            )

            const {
                compress,
                mode,
                w,
                h,
                q,
                interlace,
                ignoreError,
                format,
            } = Object.assign({
                // 是否压缩
                compress: true,
                // 模式
                mode: '2',
                // 宽
                w: 800,
                // 高
                h: 0,
                // 质量
                q: 75,
                // 是否支持渐进显示
                interlace: false,
                // 是否忽略错误
                // 主要针对图片兼容性的问题导致无法处理, 取值为 1 时, 则处理失败时返回原图
                // 不设置此参数, 默认处理失败时返回错误信息
                ignoreError: false,
                // 格式
                format: 'webp',
            }, options)

            // 如果压缩
            if (compress) {

                // 判断图片上传方式
                switch (type) {

                    // 七牛云
                    // 文档: https://developer.qiniu.com/dora/1279/basic-processing-images-imageview2
                    case 'qiniu':
                    // minio
                    case 'minio':

                        // 裁剪图片方式
                        src += `?imageView2/${mode}`

                        // 宽
                        if (w) {
                            src += '/w/' + w
                        }

                        // 高
                        if (h) {
                            src += '/h/' + h
                        }

                        // 质量
                        if (q) {
                            src += '/q/' + q
                        }

                        // 渐进显示
                        if (interlace) {
                            src += '/interlace/1'
                        }

                        // 是否忽略错误
                        if (ignoreError) {
                            src += '/ignore-error/1'
                        }

                        // 格式
                        if (format) {
                            src += '/format/' + format
                        }
                    break

                    // 【oss】
                    // -------------------------------------------------------------------------------------------------
                    // 文档: https://help.aliyun.com/document_detail/44686.html
                    case 'oss':

                        // 裁剪图片方式
                        src += `?x-oss-process=image`

                        // 缩放
                        if (w || h) {

                            src += '/resize'

                            // 宽
                            if (w) {
                                src += ',w_' + w
                            }

                            // 高
                            if (h) {
                                src += ',h_' + h
                            }
                        }

                        // 质量
                        if (q) {
                            src += '/quality,q_' + q
                        }

                        // 渐进显示
                        if (interlace) {
                            src += '/interlace,1'
                        }

                        // 格式化
                        if (format) {
                            src += '/format,' + format
                        }
                        break
                }
            }

            // 【调试模式】
            // --------------------------------------------------
            // #ifdef IS_DEBUG
            if ($n_get(options, 'upload')) {
                return $n_slash(domain, 'end', true) + src
            }
            // #endif
            // --------------------------------------------------

            return useFileUrl({ type, domain, src })
        }
    }

    return ''
}
