import $n_has from 'lodash/has'
import $n_isString from 'lodash/isString'

import $n_isValidArray from '@netang/utils/isValidArray'
import $n_isValidObject from '@netang/utils/isValidObject'
import $n_isValidString from '@netang/utils/isValidString'
import $n_isNumeric from '@netang/utils/isNumeric'
import $n_slash from '@netang/utils/slash'

import $n_config from './config'

/**
 * 获取图片
 */
export default function getImage(src, params) {

    if (src) {

        // 如果为数组, 则获取第一个
        if ($n_isValidArray(src)) {
            src = src[0]

        // 如果为对象
        } else if ($n_isValidObject(src)) {

            if ($n_has(src, 'params')) {
                params = src.params
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
            if ($n_isValidObject(params)) {

                // 【自动缩放】
                // 如果没有定义 w
                // --------------------------------------------------
                if (! $n_has(params, 'w')) {

                    const {
                        width,
                        zoom,
                    } = params

                    // 如果自动缩放
                    if (zoom && width) {

                        let w = width

                        if (! $n_isNumeric(w) && $n_isString(w)) {
                            w = w.replace('px', '')
                        }

                        if ($n_isNumeric(w)) {
                            w = Number(w)
                            if (w > 0) {

                                // 获取设备像素比
                                /* #if IS_WEB */
                                const devicePixelRatio = window.devicePixelRatio || 1
                                if (devicePixelRatio > 2) {
                                    w *= 2
                                }
                                /* #endif */

                                if (w > 10) {
                                    w = parseInt(String(w / 10)) * 10
                                } else {
                                    w = parseInt(String(w))
                                }
                                params = Object.assign({}, params, { w })
                            }
                        }
                    }
                }
                // --------------------------------------------------
            }


            const {
                type,
                domain,
            } = $n_config('uploader.upload')

            switch (type) {

                // 七牛云
                case 'qiniu':

                    const {
                        w,
                        h,
                        q,
                        // local,
                        format,
                    } = Object.assign({
                        // 宽
                        w: 0,
                        // 高
                        h: 0,
                        // 质量
                        q: 75,
                        // // 是否本地
                        // local: false,
                        // 格式
                        format: 'webp',
                    }, params)

                    // 如果是本地路径
                    // if (local) {
                    //     return src
                    // }

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

                    return $n_slash(domain, 'end', true) + src
            }
        }
    }

    return ''
}
