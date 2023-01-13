/**
 * 验证规则(用于表单验证)
 */
utils.$rule = function (rule) {
    return function(value) {
        const res = utils.validate(value, 'data', rule, '', '该值')
        if (res) {
            return res
        }
    }
}

utils.$ruleValid = function (rule) {
    return function(value) {
        return ! utils.validate(value, 'data', rule, '', '该值')
    }
}
