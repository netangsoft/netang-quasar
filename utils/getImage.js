import $n_has from 'lodash/has'
import $n_isString from 'lodash/isString'

import $n_isValidArray from '@netang/utils/isValidArray'
import $n_isValidObject from '@netang/utils/isValidObject'
import $n_isValidString from '@netang/utils/isValidString'
import $n_isNumeric from '@netang/utils/isNumeric'
import $n_split from '@netang/utils/split'

import $n_uploader from './uploader'

import useFileUrl from './useFileUrl'

/**
 * 获取图片
 */
export default function getImage(src, options) {

    if (src) {

        // 如果是字符串
        if ($n_isValidString(src)) {

            // 则按照逗号隔开转为数租
            src = $n_split(src, ',')
        }

        // 如果为数组, 则获取第一个
        if ($n_isValidArray(src)) {
            src = src[0]

        // 如果为对象
        } else if ($n_isValidObject(src)) {

            if ($n_has(src, 'options')) {
                options = src.options
            }

            if ($n_has(src, 'img')) {
                src = src.img
            }
        }

        if ($n_isValidString(src)) {

            // http(s):// 或 data: 或 blob: 开头的地址
            if (/^(http(s)?:\/\/|data:|blob:)/i.test(src)) {
                return src
            }

            // 如果为对象定义的规格
            if ($n_isValidObject(options)) {

                // 如果有定义 w
                if ($n_has(options, 'w')) {

                    let {
                        w,
                        maxWidth,
                        zoom,
                    } = options

                    // 先设为 0
                    options.w = 0

                    // 如果有宽度
                    if (w) {

                        if (
                            ! $n_isNumeric(w)
                            && $n_isString(w)
                        ) {
                            w = w.replace('px', '')
                        }

                        if ($n_isNumeric(w)) {
                            w = Number(w)
                            if (w > 0) {

                                // 获取设备像素比
                                /* #if IS_WEB */
                                // 如果开启缩放
                                if (zoom) {
                                    const devicePixelRatio = window.devicePixelRatio || 1
                                    if (devicePixelRatio > 2) {
                                        w *= 2
                                    }
                                }
                                /* #endif */

                                if (w > 10) {
                                    w = Math.floor(w / 10) * 10
                                } else {
                                    w = Math.floor(w)
                                }

                                // 如果有最大宽度
                                if (maxWidth && maxWidth > w) {
                                    w = maxWidth
                                }

                                options.w = w
                            }
                        }
                    }
                }
                // --------------------------------------------------

            } else {
                options = {}
            }

            const {
                type,
                domain,
            } = $n_uploader.getUpload()

            // 判断图片上传方式
            switch (type) {

                // 七牛云
                case 'qiniu':
                // minio
                case 'minio':
                    
                    const {
                        compress,
                        w,
                        h,
                        q,
                        format,
                    } = Object.assign({
                        // 是否压缩
                        compress: true,
                        // 宽
                        w: 0,
                        // 高
                        h: 0,
                        // 质量
                        q: 75,
                        // 格式
                        format: 'webp',
                    }, options)

                    // 如果压缩
                    if (compress) {

                        // 裁剪图片方式
                        src += '?imageView2/2'

                        // 质量
                        if (q) {
                            src += '/q/' + q
                        }

                        // 宽
                        if (w) {
                            src += '/w/' + w
                        }

                        // 高
                        if (h) {
                            src += '/h/' + h
                        }

                        // 格式
                        if (format) {
                            src += '/format/' + format
                        }
                    }

                    return useFileUrl(domain, src)
            }
        }
    }

    return ''
}
