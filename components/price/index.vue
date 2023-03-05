<template>
    <div class="n-price">
        <!-- 价格符号 -->
        <span v-if="sign" :style="signStyle">{{sign}}</span>
        <!-- 价格 -->
        <span :style="priceStyle">{{currentPrice.main}}</span>
        <!-- 价格后缀 -->
        <span :style="signStyle" v-if="currentPrice.odd">{{currentPrice.odd}}</span>
        <!-- 删除价格 -->
        <span class="n-price__del" :style="[
            signBaseStyle,
            {
                marginLeft: toPx(delPriceMarginLeft),
                color: delPriceColor,
            }
        ]" v-if="delPrice && delPrice > price">{{sign}}{{getPrice(delPrice)}}</span>
    </div>
</template>

<script>
import { computed } from 'vue'

import $n_px from '@netang/utils/px'
import $n_split from '@netang/utils/split'

import $n_price from '../../utils/price'

export default {

    /**
     * 标识
     */
    name: 'NPrice',

    /**
     * 声明属性
     */
    props: {
        // 颜色
        color: {
            type: String,
            default: '#ff3750',
        },
        // 删除价格颜色
        delPriceColor: {
            type: String,
            default: '#999999',
        },
        // 价格符号
        sign: {
            type: [ String, Boolean ],
            default: '¥'
        },
        // 价格符号大小
        signSize: {
            type: Number,
            default: 12,
        },
        // 价格符号是否加粗
        signBold: {
            type: Boolean,
            default: true,
        },
        // 价格
        price: [ String, Number ],
        // 最高价格
        maxPrice: [ String, Number ],
        // 删除价格
        delPrice: [ String, Number ],
        // 删除价格左边距
        delPriceMarginLeft: {
            type: [ String, Number ],
            default: 8,
        },
        // 价格符号大小
        priceSize: {
            type: Number,
            default: 16,
        },
        // 价格是否加粗
        priceBold: {
            type: Boolean,
            default: true,
        },
    },

    /**
     * 组合式
     */
    setup(props) {

        // ==========【计算属性】==========================================================================================

        /**
         * 当前价格
         */
        const currentPrice = computed(function () {

            const price = $n_price(props.price)
            const arr = $n_split(String(price), '.')

            return {
                main: arr[0],
                odd: arr.length > 1 ? '.' + arr[1] : ''
            }
        })

        /**
         * 价格符号基础样式
         */
        const signBaseStyle = computed(function () {
            return {
                fontSize: $n_px(props.signSize),
                marginBottom: $n_px((props.priceSize - props.signSize) * 0.5 / 2),
            }
        })

        /**
         * 价格符号样式
         */
        const signStyle = computed(function () {

            const style = {
                color: props.color,
            }

            if (props.signBold) {
                style.fontWeight = 'bold'
            }

            return [
                style,
                signBaseStyle.value,
            ]
        })

        /**
         * 价格样式
         */
        const priceStyle = computed(function () {

            const style = {
                color: props.color,
                fontSize: $n_px(props.priceSize),
            }

            if (props.priceBold) {
                style.fontWeight = 'bold'
            }

            return style
        })

        // ==========【方法】=============================================================================================

        return {
            // 当前价格
            currentPrice,
            // 价格符号基础样式
            signBaseStyle,
            // 价格符号样式
            signStyle,
            // 价格样式
            priceStyle,

            // 转为像素
            toPx: $n_px,
            // 获取价格
            getPrice: $n_price
        }
    },
}
</script>

<style lang="scss">

.n-price {
    display: flex;
    flex-direction: row;
    align-items: flex-end;

    // 删除价格
    &__del {
       text-decoration: line-through;
   }
}

</style>
