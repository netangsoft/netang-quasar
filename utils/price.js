/**
 * 换算金额
 */
utils.price = function(value, params) {
    return utils.decimal(value, Object.assign({
        // 最小值
        min: 0,
        // 小数点位数
        decimalLength: 2,
        // 是否开启人民币分转元(如值 189 -> 1.89)
        centToYuan: utils.config('priceCent') === true,
    }, params))
}
