/**
 * 获取文件
 */
$n.getFile = function(src) {

    if (src) {

        // 如果为数组, 则获取第一个
        if ($n.isValidArray(src)) {
            src = src[0]
        }

        if ($n.isValidString(src)) {

            // http(s):// 或 data: 或 blob: 开头的地址
            if (/^(http(s)?:\/\/|data:|blob:)/i.test(src)) {
                return src
            }

            const uploaderConfig = $n.config('uploader.upload')
            switch (uploaderConfig.type) {
                // 七牛云
                case 'qiniu':
                    return $n.slash(uploaderConfig.domain, 'end', true) + src
            }
        }
    }

    return ''
}
