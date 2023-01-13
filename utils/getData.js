import { isRef } from 'vue'

/**
 * 获取公共数据
 */
utils.getData = async function(url, pageStatus, emptyDescription, refValue) {

    const warn = _.isNil(pageStatus) || ! isRef(pageStatus)

    // 如果是数组, 说明需要同时请求多个地址
    // --------------------------------------------------
    if (Array.isArray(url)) {

        const result = await utils.http(_.map(url, function (item) {
            return {
                url: utils.config('commonDataUrl') + item,
                warn,
            }
        }))

        const res = []

        for (const { status, data } of result) {
            if (! status) {
                if (! warn) {
                    pageStatus.value = false
                }
                if (! _.isNil(emptyDescription) && isRef(emptyDescription)) {
                    emptyDescription.value = data.msg
                }
                return false
            }
            res.push(data)
        }

        return res
    }

    // 单个请求
    // --------------------------------------------------
    const { status, data } = await utils.http({
        url: utils.config('commonDataUrl') + url,
        warn,
    })
    if (! status) {
        if (! warn) {
            pageStatus.value = false
        }
        if (! _.isNil(emptyDescription) && isRef(emptyDescription)) {
            emptyDescription.value = data.msg
        }
        return false
    }

    // 直接设置 value
    if (! _.isNil(refValue) && isRef(refValue)) {
        refValue.value = data
    }

    return data
}
