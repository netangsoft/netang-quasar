/**
 * 换算金额
 */
$n.price = function(value, params) {
    return $n.decimal(value, Object.assign({
        // 最小值
        min: 0,
        // 小数点位数
        decimalLength: 2,
        // 是否开启人民币分转元(如值 189 -> 1.89)
        centToYuan: $n.config('priceCent') === true,
    }, params))
}
