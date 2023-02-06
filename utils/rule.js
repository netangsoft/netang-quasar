import { validate as $n_validate } from '@netang/utils/validator'

/**
 * 单个验证规则(用于表单验证)
 */
export default function rule(rule) {
    return function(value) {
        const res = $n_validate(value, 'data', rule, '', '该值')
        if (res) {
            return res
        }
    }
}
