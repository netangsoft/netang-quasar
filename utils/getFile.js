/**
 * 获取文件
 */
utils.getFile = function(src) {

    if (src) {

        // 如果为数组, 则获取第一个
        if (utils.isValidArray(src)) {
            src = src[0]
        }

        if (utils.isValidString(src)) {

            // http(s):// 或 data: 或 blob: 开头的地址
            if (/^(http(s)?:\/\/|data:|blob:)/i.test(src)) {
                return src
            }

            const uploaderConfig = utils.config('uploader.upload')
            switch (uploaderConfig.type) {
                // 七牛云
                case 'qiniu':
                    return utils.slash(uploaderConfig.domain, 'end', true) + src
            }
        }
    }

    return ''
}
