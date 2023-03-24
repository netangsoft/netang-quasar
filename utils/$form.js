import { ref, provide, inject } from 'vue'

import $n_has from 'lodash/has'
import $n_cloneDeep from 'lodash/cloneDeep'

import { NPowerKey, NFormKey } from './symbols'

/**
 * 创建表单
 */
function create(params) {

    // ==========【数据】=================================================================================================

    // 获取参数
    const o = Object.assign({
        // 初始表单数据
        formData: {},
        // 重置表单方法
        resetForm: null,
    }, params)

    // 获取权限注入
    const $power = $n_has(params, '$power') ? params.$power : inject(NPowerKey)

    // ==========【返回】=================================================================================================

    const resForm = {
        // 表单节点
        formRef: ref(null),
        // 初始表单数据, 该数据不会更新
        initFormData: o.formData,
        // 原始表单数据(初始时为 formData, 使用 setRaw 会更新该数据)
        rawFormData: ref(o.formData),
        // 请求服务器的原始表单数据(初始时为 null, 只有执行 setRaw 方法才会生成, 用于请求接口使用)
        requestRawFormData: ref(null),
        // 表单数据
        formData: ref(o.formData),
        // 表单参数
        options: o,
    }

    /**
     * 设置原始数据
     */
    resForm.setRaw = function (value) {
        resForm.rawFormData.value = $n_cloneDeep(value)
        resForm.requestRawFormData.value = resForm.rawFormData.value
        return value
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
const $form = {
    // 创建表单
    create,
}

export default $form
