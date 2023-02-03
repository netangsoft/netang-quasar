/**
 * 验证规则(用于表单验证)
 */
$n.$rule = function (rule) {
    return function(value) {
        const res = $n.validate(value, 'data', rule, '', '该值')
        if (res) {
            return res
        }
    }
}

$n.$ruleValid = function (rule) {
    return function(value) {
        return ! $n.validate(value, 'data', rule, '', '该值')
    }
}
