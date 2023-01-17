<template>
    <q-input
        v-model="currentValue"
        @blur="onBlur"
        v-bind="inputProps"
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

import inputProps from '../../props/quasar/input'

// 自定义声明属性
const currentProps = {
    // 值
    modelValue: [String, Number],
    // 最小值(元)
    min: {
        type: Number,
        default: 1,
    },
    // 最大值(元)
    max: Number,
}

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
        ...inputProps,

        // 自定义声明属性
        ...currentProps,
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

        // 输入框组件传参
        const inputProps = _.omit(props, Object.keys(currentProps))

        // 当前值
        const currentValue = ref(formatModelValue())

        // ==========【计算属性】==========================================================================================

        /**
         * 插槽标识数组
         */
        const slotNames = computed(function() {
            if (utils.isFillObject(slots)) {
                return Object.keys(slots)
            }
            return []
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
                    if (Number.isFinite(props.max)) {
                        if (val.isGreaterThanOrEqualTo(props.max)) {

                            // 更新当前值
                            currentValue.value = props.max

                            // 提交值
                            emitModelValue(currentValue.value)
                            return
                        }
                    }

                    // 如果值 <= 最小值
                    if (Number.isFinite(props.min)) {
                        if (val.isLessThanOrEqualTo(props.min)) {

                            // 更新当前值
                            currentValue.value = props.min

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
            // 输入框组件传参
            inputProps,
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
