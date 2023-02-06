import { validate as $n_validate } from '@netang/utils/validator'

/**
 * 单个验证真假规则(用于表单验证)
 */
export default function ruleValid (rule) {
    return function(value) {
        return ! $n_validate(value, 'data', rule, '', '该值')
    }
}
