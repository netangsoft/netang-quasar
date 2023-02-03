import { ref, provide, inject } from 'vue'

import { NPowerKey, NFormKey } from './symbols'

/**
 * 创建表单
 */
function create(params) {

    // ==========【数据】=================================================================================================

    // 获取参数
    const o = Object.assign({
        // 表单数据
        formData: {},
        // 重置表单
        resetForm: null,
    }, params)

    // 获取权限注入
    const $power = $n.has(params, '$power') ? params.$power : inject(NPowerKey)

    // ==========【返回】=================================================================================================

    const resForm = {
        // 表单节点
        formRef: ref(null),
        // 原始表单数据
        rawFormData: o.formData,
        // 表单数据
        formData: ref(o.formData),
    }

    if ($power) {
        $power.update(function(data, _data) {
            _data.$form = resForm
        })
    }

    // 提供可以被后代组件注入的值
    provide(NFormKey, resForm)

    return resForm
}

/**
 * 业务表单
 */
$n.$form = {
    // 创建表单
    create,
}
