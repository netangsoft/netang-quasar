import { isRef } from 'vue'

import $n_isNil from 'lodash/isNil'
import $n_map from 'lodash/map'

import $n_http from '@netang/utils/http'

import { configs } from './config'

/**
 * 获取公共数据
 */
export default async function getData(url, pageStatus, emptyDescription, refValue) {

    const warn = $n_isNil(pageStatus) || ! isRef(pageStatus)

    // 如果是数组, 说明需要同时请求多个地址
    // --------------------------------------------------
    if (Array.isArray(url)) {

        const result = await $n_http($n_map(url, function (item) {
            return {
                url: configs.commonDataUrl + item,
                warn,
            }
        }))

        const res = []

        for (const { status, data } of result) {
            if (! status) {
                if (! warn) {
                    pageStatus.value = false
                }
                if (! $n_isNil(emptyDescription) && isRef(emptyDescription)) {
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
    const { status, data } = await $n_http({
        url: configs.commonDataUrl + url,
        warn,
    })
    if (! status) {
        if (! warn) {
            pageStatus.value = false
        }
        if (! $n_isNil(emptyDescription) && isRef(emptyDescription)) {
            emptyDescription.value = data.msg
        }
        return false
    }

    // 直接设置 value
    if (! $n_isNil(refValue) && isRef(refValue)) {
        refValue.value = data
    }

    return data
}
