import { isRef } from 'vue'

import $n_has from 'lodash/has'
import $n_isNil from 'lodash/isNil'
import $n_map from 'lodash/map'

import $n_http from '@netang/utils/http'
import $n_isValidObject from '@netang/utils/isValidObject'

import $n_config from './config'

/**
 * 获取公共数据
 * @param {String|Array|Object} url 请求地址
 * @param pageStatus 页面状态
 * @param emptyDescription 空状态描述
 * @param refValue 请求成功后设置值
 * @returns
 */
export default async function getData(url, pageStatus = null, emptyDescription = null, refValue = null) {

    const warn = $n_isNil(pageStatus) || ! isRef(pageStatus)

    // 获取单个请求配置
    function getSingleHttpOptions(opt) {

        // 如果是对象
        if ($n_isValidObject(opt)) {
            opt.url = $n_config('apiDataUrl') + opt.url
            if (! $n_has(opt, 'warn')) {
                opt.warn = warn
            }
            return opt
        }

        // 否则为字符串
        return {
            url: $n_config('apiDataUrl') + opt,
            warn,
        }
    }

    // 如果是数组, 说明需要同时请求多个地址
    // --------------------------------------------------
    if (Array.isArray(url)) {

        const result = await $n_http($n_map(url, function (item) {
            return getSingleHttpOptions(item)
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
    const { status, data } = await $n_http(getSingleHttpOptions(url))
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
