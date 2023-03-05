import $n_decimal from '@netang/utils/decimal'

import $n_config from './config'

/**
 * 换算金额
 */
export default function price(value, options) {

    return $n_decimal(value, Object.assign({
        // 最小值
        min: 0,
        // 小数点位数
        decimalLength: 2,
        // 是否开启人民币分转元(如值 189 -> 1.89)
        centToYuan: $n_config('priceCentToYuan') === true,
    }, options))
}
