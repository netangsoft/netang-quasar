<template>
    <q-input
        class="n-input-number"
        v-model="currentValue"
        @blur="onBlur"
        v-bind="$attrs"
    >
        <template #prepend v-if="showPlus">
            <q-btn
                color="default"
                icon="remove"
                flat
                dense
                :disable="minusDisabled"
                @click="onChange('minus')"
                @overlimit="onOverlimit('minus')"
            />
        </template>
        <template #append v-if="showMinus">
            <q-btn
                color="default"
                icon="add"
                flat
                dense
                :disable="plusDisabled"
                @click="onChange('plus')"
                @overlimit="onOverlimit('plus')"
            />
        </template>
    </q-input>
</template>

<script>
import { computed, ref, watch } from 'vue'

export default {

    /**
     * 标识
     */
    name: 'NInputNumber',

    /**
     * 声明属性
     */
    props: {
        // 值
        modelValue: {
            required: false
        },
        // 最小值
        min: {
            type: [Number, String],
            default: 0,
        },
        // 最大值
        max: {
            type: [Number, String],
            default: Infinity,
        },
        // 步长, 每次点击时改变的值(默认为 1, centToYuan开启后默认为 100)
        step: [Number, String],
        // 小数位数(默认为 0, centToYuan开启后默认为 2)
        decimalLength: [Number, String],
        // 是否禁用数字输入框
        disabled: Boolean,
        // 是否禁用增加按钮
        disablePlus: Boolean,
        // 是否禁用减少按钮
        disableMinus: Boolean,
        // 是否禁用输入框
        disableInput: Boolean,
        // 是否显示增加按钮
        showPlus: Boolean,
        // 是否显示减少按钮
        showMinus: Boolean,
        // 不允许输入的值为空
        noEmpty: Boolean,
        // 是否为人民币的分转元(值为分, 显示为元)
        // 如果为 true, 则 min / max / step 的值默认的单位为人民币的分
        centToYuan: Boolean,
    },

    /**
     * 声明事件
     */
    emits: [
        'update:modelValue',
        'change',
        'blur',
        'overlimit',
        'minus',
        'plus',
    ],

    /**
     * 组合式
     */
    setup(props, { emit }) {

        // ==========【计算属性】=========================================================================================

        /**
         * 当前最小值
         */
        const currentMin = computed(function() {
            // 格式化数字
            return formatNumber(props.min, props.centToYuan, true, null)
        })

        /**
         * 当前最大值
         */
        const currentMax = computed(function() {

            // 如果为无限大
            if (props.max === Infinity) {
                // 则返回无限大
                return Infinity
            }

            // 格式化数字
            return formatNumber(props.max, props.centToYuan, true, null)
        })

        /**
         * 当前步长(默认为 1, centToYuan开启后默认为 100)
         */
        const currentStep = computed(function() {
            // 格式化数字
            return formatNumber(props.step ?? (props.centToYuan ? 100 : 1), props.centToYuan, true, null)
        })

        /**
         * 当前小数位数(默认为 0, centToYuan开启后默认为 2)
         */
        const currentDecimalLength = computed(function() {
            return props.decimalLength ?? (props.centToYuan ? 2 : 0)
        })

        /**
         * 是否禁用减少按钮
         */
        const minusDisabled = computed(function () {
            return props.disabled
                || props.disableMinus
                || currentValue.value <= +currentMin.value
        })

        /**
         * 是否禁用增加按钮
         */
        const plusDisabled = computed(function () {
            return props.disabled
                || props.disablePlus
                || currentValue.value >= +currentMax.value
        })

        // ==========【数据】============================================================================================

        // 当前值
        const currentValue = ref(formatModelValue(props.modelValue))

        // 如果当前值 !== 声明值
        if (currentValue.value !== props.modelValue) {
            // 则更新值
            emit('update:modelValue', currentValue.value)
        }

        // ==========【监听数据】=========================================================================================

        /**
         * 监听声明值
         */
        watch(()=>props.modelValue, function (val) {
            if (val !== currentValue.value) {
                val = formatModelValue(val)
                if (val !== currentValue.value) {
                    currentValue.value = val
                }
            }
        })

        /**
         * 监听当前值
         */
        watch(currentValue, function (val) {
            // 更新值
            emitModelValue(val)
        })

        /**
         * 监听其他
         */
        watch([()=>props.max, ()=>props.min, ()=>props.decimalLength], function () {
            const val = formatModelValue(currentValue.value)
            if (val !== currentValue.value) {
                // 更新值
                emitModelValue(val)
            }
        })

        // ==========【方法】=============================================================================================

        /**
         * 更新值
         */
        function emitModelValue(val) {
            // 更新值
            emit('update:modelValue', val)
        }

        /**
         * 格式化数字
         */
        function formatNumber(val, isCentToYuan, isToNumber, defaultValue) {

            // 转为 BigNumber 类型
            val = new BigNumber(val)

            // 如果为有效数字
            if (val.isFinite()) {

                // 如果为 0
                if (val.isZero()) {
                    return 0
                }

                // 如果为人民币的分转元
                if (isCentToYuan) {
                    // 除 100
                    val = val.dividedBy(100)
                }

                // 如果设置了小数位数
                if (currentDecimalLength.value > 0) {

                    // 如果值精度 > 设置的小数位数
                    if (val.dp() > currentDecimalLength.value) {
                        // 将值向下舍入 xx 位精度(如 68.345 -> 68.34)
                        val = val.dp(currentDecimalLength.value, BigNumber.ROUND_DOWN)
                    }

                // 否则值为整数
                } else {
                    // 将值向下取整
                    val = val.integerValue(BigNumber.ROUND_DOWN)
                }

                // 转为数字
                return isToNumber ? val.toNumber() : val
            }

            return defaultValue
        }

        /**
         * 格式化值
         */
        function formatModelValue(value) {

            // 格式化数字
            const val = formatNumber(value, false, false, false)

            // 如果为有效数字
            if (val !== false) {

                // 如果为 0
                if (val === 0) {
                    return 0
                }

                // 如果值 >= 最大值
                if (currentMax.value !== null && val.gte(currentMax.value)) {

                    // 返回最大值
                    return currentMax.value
                }

                // 如果值 <= 最小值
                if (currentMin.value !== null && val.lte(currentMin.value)) {

                    // 返回最小值
                    return currentMin.value
                }

                // 将值转为数字
                return val.toNumber()
            }

            if (
                // 如果不允许值为空
                props.noEmpty
                // 如果有最小值
                && currentMin.value !== null
            ) {
                // 则返回最小值
                return currentMin.value
            }

            return ''
        }

        /**
         * 失去焦点触发
         */
        function onBlur(value) {

            // 格式化值
            value = formatModelValue(currentValue.value)

            // 如果值有变动
            if (value !== currentValue.value) {

                // 更新值
                emitModelValue(value)

                // 失去焦点触发
                emit('blur', value)
            }
        }

        /**
         * 改变值
         */
        function onChange(type) {

            // 如果增加/减少按钮被禁用
            if (props[`${type}Disabled`]) {
                // 点击不可用的按钮时触发
                emit('overlimit', type)
                return
            }

            const value = formatModelValue(
                new BigNumber(+currentValue.value)
                    // 增加 / 减少
                    .plus(type === 'minus' ? -currentStep.value : +currentStep.value)
                    .toNumber()
            )

            // 如果值有变动
            if (value !== currentValue.value) {

                // 更新值
                emitModelValue(value)

                // 触发增加/减少
                emit(type)
            }
        }

        /**
         * 点击不可用的按钮时触发
         */
        function onOverlimit(type) {
            emit('overlimit', type)
        }

        // ==========【返回】=============================================================================================

        return {
            // 当前值
            currentValue,

            // 是否禁用减少按钮
            minusDisabled,
            // 是否禁用增加按钮
            plusDisabled,

            // 失去焦点触发
            onBlur,
            // 改变值
            onChange,
            // 点击不可用的按钮时触发
            onOverlimit,
        }
    }
}
</script>

<style lang="scss">
@import "@/assets/sass/var.scss";

//.n-input-number {
//    &.q-field {
//        &--outlined {
//            .q-field__control {
//                padding: 0 4px !important;
//                .q-field__native {
//                    text-align: center;
//                }
//            }
//        }
//    }
//}
</style>

