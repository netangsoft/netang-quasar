/**
 * 获取图片
 */
utils.getImage = function(src, params) {

    if (src) {

        // 如果为数组, 则获取第一个
        if (utils.isValidArray(src)) {
            src = src[0]

        // 如果为对象
        } else if (utils.isValidObject(src)) {

            if (_.has(src, 'params')) {
                params = src.params
            }

            if (_.has(src, 'img')) {
                src = src.img
            }
        }

        if (utils.isValidString(src)) {

            // http(s):// 或 data: 或 blob: 开头的地址
            if (/^(http(s)?:\/\/|data:|blob:)/i.test(src)) {
                return src
            }

            // 如果为对象定义的规格
            if (utils.isValidObject(params)) {

                // 【自动缩放】
                // 如果没有定义 w
                // --------------------------------------------------
                if (! _.has(params, 'w')) {

                    const {
                        width,
                        zoom,
                    } = params

                    // 如果自动缩放
                    if (zoom && width) {

                        let w = width

                        if (! utils.isNumeric(w) && _.isString(w)) {
                            w = w.replace('px', '')
                        }

                        if (utils.isNumeric(w)) {
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

            const uploaderConfig = utils.config('uploader.upload')
            switch (uploaderConfig.type) {
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

                    return utils.slash(uploaderConfig.domain, 'end', true) + src
            }
        }
    }

    return ''
}
