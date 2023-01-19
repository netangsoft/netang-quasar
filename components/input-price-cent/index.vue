<template>
    <q-input
        v-model="currentValue"
        @blur="onBlur"
        v-bind="$attrs"
    >
        <template
            v-for="slotName in slotNames"
            v-slot:[slotName]
        >
            <slot :name="slotName" />
        </template>
    </q-input>
</template>

<script>
import { computed, ref, watch } from 'vue'

/**
 * 金额(分转元)
 */
export default {

    /**
     * 标识
     */
    name: 'NInputPrice',

    /**
     * 声明属性
     */
    props: {
        // 值
        modelValue: [String, Number],
        // 最小值(分)
        min: {
            type: Number,
            default: 1,
        },
        // 最大值(分)
        max: Number,
    },

    /**
     * 声明事件
     */
    emits: [
        'update:modelValue',
    ],

    /**
     * 组合式
     */
    setup(props, { emit, slots }) {

        // ==========【数据】============================================================================================

        // 当前值
        const currentValue = ref(formatModelValue())

        // ==========【计算属性】==========================================================================================

        /**
         * 插槽标识数组
         */
        const slotNames = computed(function() {
            if (utils.isValidObject(slots)) {
                return Object.keys(slots)
            }
            return []
        })

        /**
         * 最大值
         */
        const maxValue = computed(function() {
            const maxValue = new BigNumber(props.max)
            if (maxValue.isFinite()) {
                return maxValue
                    .dividedBy(100)
                    .toNumber()
            }
            return null
        })

        /**
         * 最小值
         */
        const minValue = computed(function() {
            const maxValue = new BigNumber(props.min)
            if (maxValue.isFinite()) {
                return maxValue
                    .dividedBy(100)
                    .toNumber()
            }
            return null
        })

        // ==========【监听数据】=========================================================================================

        /**
         * 监听声明值
         */
        watch(()=>props.modelValue, function() {
            currentValue.value = formatModelValue()
        })

        // ==========【方法】=============================================================================================

        /**
         * 格式化传值
         */
        function formatModelValue() {
            // 分转元
            return utils.price(props.modelValue, '')
        }

        /**
         * 提交值
         */
        function emitModelValue(newVal) {
            // 更新值(元转分)
            emit('update:modelValue', utils.priceYuanToCent(newVal, ''))
        }

        /**
         * 失去焦点触发
         */
        function onBlur() {

            if (utils.isValidValue(currentValue.value)) {

                let val = new BigNumber(currentValue.value)

                if (val.isFinite()) {

                    // 值是否有更新
                    let isChange = false

                    if (
                        // 如果值 > 0
                        val.isGreaterThan(0)
                        // 如果值精度 > 2
                        && val.decimalPlaces() > 2
                    ) {
                        // 值有更新
                        isChange = true

                        // 将元向下舍入 2 位精度(如 68.345 -> 68.34)
                        val = val.decimalPlaces(2, BigNumber.ROUND_DOWN)
                    }

                    // 如果值 >= 最大值
                    if (maxValue.value !== null) {
                        if (val.isGreaterThanOrEqualTo(maxValue.value)) {

                            // 更新当前值
                            currentValue.value = maxValue.value

                            // 提交值
                            emitModelValue(currentValue.value)
                            return
                        }
                    }

                    // 如果值 <= 最小值
                    if (minValue.value !== null) {
                        if (val.isLessThanOrEqualTo(minValue.value)) {

                            // 更新当前值
                            currentValue.value = minValue.value

                            // 提交值
                            emitModelValue(currentValue.value)
                            return
                        }
                    }

                    // 获取最新值
                    val = val.toNumber()

                    if (isChange) {
                        // 更新当前值
                        currentValue.value = val
                    }

                    // 提交值
                    emitModelValue(val)
                    return
                }
            }

            // 更新当前值
            currentValue.value = ''

            // 提交值
            emitModelValue(currentValue.value)
        }

        // ==========【返回】=============================================================================================

        return {
            // 当前值
            currentValue,
            // 插槽标识数组
            slotNames,

            // 失去焦点触发
            onBlur,
        }
    },
}
</script>
