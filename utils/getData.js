import { isRef } from 'vue'

/**
 * 获取公共数据
 */
$n.getData = async function(url, pageStatus, emptyDescription, refValue) {

    const warn = $n.isNil(pageStatus) || ! isRef(pageStatus)

    // 如果是数组, 说明需要同时请求多个地址
    // --------------------------------------------------
    if (Array.isArray(url)) {

        const result = await $n.http($n.map(url, function (item) {
            return {
                url: $n.config('commonDataUrl') + item,
                warn,
            }
        }))

        const res = []

        for (const { status, data } of result) {
            if (! status) {
                if (! warn) {
                    pageStatus.value = false
                }
                if (! $n.isNil(emptyDescription) && isRef(emptyDescription)) {
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
    const { status, data } = await $n.http({
        url: $n.config('commonDataUrl') + url,
        warn,
    })
    if (! status) {
        if (! warn) {
            pageStatus.value = false
        }
        if (! $n.isNil(emptyDescription) && isRef(emptyDescription)) {
            emptyDescription.value = data.msg
        }
        return false
    }

    // 直接设置 value
    if (! $n.isNil(refValue) && isRef(refValue)) {
        refValue.value = data
    }

    return data
}
