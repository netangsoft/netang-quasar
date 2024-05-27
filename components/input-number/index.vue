<template>
    <q-input
        class="n-input-number"
        :class="{
            'n-input-number--center': center,
        }"
        :disable="disable"
        :readonly="readonly"
        v-model="currentValue"
        @update:model-value="onUpdate"
        @blur="onBlur"
        v-bind="$attrs"
    >
        <!-- 内部前置插槽 -->
        <template #prepend v-if="controls && center">

            <!-- 减少按钮 -->
            <q-btn
                class="n-input-number__left"
                color="default"
                icon="remove"
                flat
                dense
                :disable="currentDisableMinus"
                @click="onChange('minus')"
            />

            <!-- 内部前置插槽 -->
            <slot name="prepend" />

        </template>

        <!-- 内部后置插槽 -->
        <template #append v-if="controls">

            <!-- 内部后置插槽 -->
            <slot name="append" />

            <!-- 减少按钮 -->
            <q-btn
                color="default"
                icon="remove"
                flat
                dense
                :disable="currentDisableMinus"
                @click="onChange('minus')"
                v-if="! center"
            />

            <!-- 增加按钮 -->
            <q-btn
                class="n-input-number__right"
                color="default"
                icon="add"
                flat
                dense
                :disable="currentDisablePlus"
                @click="onChange('plus')"
            />

        </template>

        <!-- 插槽 -->
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
import BigNumber from 'bignumber.js'

import $n_filter from 'lodash/filter'

import $n_isValidObject from '@netang/utils/isValidObject'
import $n_sleep from '@netang/utils/sleep'

export default {

    /**
     * 标识
     */
    name: 'NInputNumber',

    /**
     * 声明属性
     */
    props: {
        // 值 v-model
        modelValue: {
            required: true,
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
        // 是否禁用减少按钮
        disableMinus: Boolean,
        // 是否禁用增加按钮
        disablePlus: Boolean,
        // 是否使用控制按钮
        controls: Boolean,
        // 居中显示
        center: Boolean,
        // 不允许输入的值为空
        noEmpty: Boolean,
        // 是否为人民币的分转元(值为分, 显示为元)
        // 如果为 true, 则 min / max / step 的值默认的单位为人民币的分
        centToYuan: Boolean,
        // 精度舍入模式(默认: 向下取整)
        // 参考文档: https://mikemcl.github.io/bignumber.js/#constructor-properties
        roundMode: {
            type: Number,
            default: BigNumber.ROUND_DOWN,
        },
        // 是否禁用
        disable: Boolean,
        // 是否只读
        readonly: Boolean,
        // 延迟时间
        updateDelayTime: {
            type: Number,
            default: 500,
        },
    },

    /**
     * 声明事件
     */
    emits: [
        'update:modelValue',
        'blur',
        'minus',
        'plus',
    ],

    /**
     * 组合式
     */
    setup(props, { emit, slots }) {

        // ==========【数据】============================================================================================

        // 创建睡眠实例
        const sleep = $n_sleep()

        // ==========【计算属性】=========================================================================================

        /**
         * 插槽标识
         */
        const slotNames = computed(function() {

            if ($n_isValidObject(slots)) {

                // 忽略插槽
                const ignoreKeys = []

                if (props.controls) {
                    ignoreKeys.push('append')

                    if (props.center) {
                        ignoreKeys.push('prepend')
                    }
                }

                const keys = Object.keys(slots)

                if (ignoreKeys.length) {
                    return $n_filter(keys, e => ignoreKeys.indexOf(e) === -1)
                }

                return keys
            }

            return []
        })

        /**
         * 当前最小值
         */
        const currentMin = computed(function() {
            // 格式化数字
            return formatNumber(props.min, true, true, null)
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
            return formatNumber(props.max, true, true, null)
        })

        /**
         * 当前步长(默认为 1, centToYuan开启后默认为 100)
         */
        const currentStep = computed(function() {

            // 格式化数字
            return formatNumber(props.step ?? (props.centToYuan ? 100 : 1), true, true, null)
        })

        /**
         * 当前小数位数(默认为 0, centToYuan开启后默认为 2)
         */
        const currentDecimalLength = computed(function() {
            return props.decimalLength ?? (props.centToYuan ? 2 : 0)
        })

        /**
         * 当前是否禁用减少按钮
         */
        const currentDisableMinus = computed(function () {

            // 如果禁用 || 如果只读 || 禁用减少按钮
            if (props.disable || props.readonly || props.disableMinus) {
                // 则禁用减少按钮
                return true
            }

            // 如果没有当前最小值
            if (currentMin.value === null) {
                // 则不禁用减少按钮
                return false
            }

            // 将当前值转为 BigNumber 类型
            const val = new BigNumber(currentValue.value)

            // 如果当前值不是有效数字
            if (! val.isFinite()) {
                // 则禁用减少按钮
                return true
            }

            // 当前值 <= 当前最小值
            return val.lte(currentMin.value)
        })

        /**
         * 当前是否禁用增加按钮
         */
        const currentDisablePlus = computed(function () {

            // 如果禁用 || 如果只读 || 禁用增加按钮
            if (props.disable || props.readonly || props.disablePlus) {
                // 则禁用增加按钮
                return true
            }

            // 如果没有当前最大值
            if (currentMax.value === null) {
                // 则不禁用增加按钮
                return false
            }

            // 将当前值转为 BigNumber 类型
            const val = new BigNumber(currentValue.value)

            // 如果当前值不是有效数字
            if (! val.isFinite()) {
                // 则禁用减少按钮
                return true
            }

            // 当前值 >= 当前最大值
            return val.gte(currentMax.value)
        })

        // ==========【数据】============================================================================================

        // 格式化为当前值
        const currentValue = ref(formatToCurrentValue(props.modelValue, true))

        // 如果当前值 !== 声明值
        const rawModelValue = formatToModelValue(currentValue.value)
        if (rawModelValue !== props.modelValue) {

            // 触发更新值
            emitModelValue(rawModelValue)
        }

        // ==========【监听数据】=========================================================================================

        /**
         * 监听声明值
         */
        watch(() => props.modelValue, function (val) {

            // 格式化为当前值
            val = formatToCurrentValue(val, true)

            // 如果当前值有变化
            if (val !== currentValue.value) {
                // 更新当前值
                currentValue.value = val
                // 触发更新值
                emitModelValue(formatToModelValue(val))
            }
        })

        /**
         * 监听 当前最小值 / 当前最大值 / 当前小数位数
         */
        watch([currentMin, currentMax, currentDecimalLength], onUpdate)

        // ==========【方法】=============================================================================================

        /**
         * 触发更新值
         */
        function emitModelValue(val) {

            // 触发更新值
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

                // 如果不为 0
                if (! val.isZero()) {

                    // 如果为人民币的分转元
                    if (props.centToYuan && isCentToYuan) {
                        // 除 100
                        val = val.dividedBy(100)
                    }

                    // 如果设置了小数位数
                    if (currentDecimalLength.value) {
                        // 将值舍入 xx 位精度(如 68.345 -> 68.34)
                        val = val.dp(currentDecimalLength.value, props.roundMode)

                    // 否则值为整数
                    } else {
                        // 将值取整
                        val = val.integerValue(props.roundMode)
                    }
                }

                // 转为数字
                return isToNumber ? val.toNumber() : val
            }

            return defaultValue
        }

        /**
         * 格式化为更新值
         */
        function formatToModelValue(value) {

            // 转为 BigNumber 类型
            let val = new BigNumber(value)

            // 如果不是有效数字
            if (! val.isFinite()) {

                // 返回当前值
                return value
            }

            // 如果为人民币的分转元
            if (props.centToYuan) {
                // 乘以 100
                val = val.times(100)
                    // 再取整(分必须是整数)
                    .integerValue(props.roundMode)
            }

            // 将值转为数字
            return val.toNumber()
        }

        /**
         * 格式化值
         */
        function formatToCurrentValue(value, isCentToYuan) {

            // 格式化数字
            const val = formatNumber(value, isCentToYuan, false, false)

            // 如果为有效数字
            if (val !== false) {

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
         * 更新值触发
         */
        async function onUpdate() {

            // 延迟执行
            if (props.updateDelayTime) {
                await sleep(props.updateDelayTime)
            }

            // 格式化当前值
            const newVal = formatToCurrentValue(currentValue.value, false)

            // 如果当前值有变化
            if (newVal !== currentValue.value) {
                // 更新当前值
                currentValue.value = newVal
                // 更新值
                emitModelValue(formatToModelValue(newVal))
            }
        }

        /**
         * 失去焦点触发
         */
        function onBlur() {

            // 格式化当前值
            let val = formatToCurrentValue(currentValue.value, false)

            // 更新当前值
            currentValue.value = val

            // 将当前值转为声明值
            val = formatToModelValue(val)

            // 触发更新值
            emitModelValue(val)

            // 失去焦点触发
            emit('blur', val)
        }

        /**
         * 改变值
         */
        function onChange(type) {

            // 格式化当前值
            const val = formatToCurrentValue(
                new BigNumber(+currentValue.value)
                    // 增加 / 减少
                    .plus(type === 'minus' ? -currentStep.value : +currentStep.value)
                    .toNumber()
                , false
            )

            // 如果当前值有变动
            if (val !== currentValue.value) {

                // 更新当前值
                currentValue.value = val

                // 触发更新值
                emitModelValue(formatToModelValue(val))
            }
        }

        // ==========【返回】=============================================================================================

        return {
            // 插槽标识
            slotNames,
            // 当前值
            currentValue,
            // 当前是否禁用减少按钮
            currentDisableMinus,
            // 当前是否禁用增加按钮
            currentDisablePlus,

            // 更新值触发
            onUpdate,
            // 失去焦点触发
            onBlur,
            // 改变值
            onChange,
        }
    }
}
</script>

<style lang="scss">
.n-input-number {

    // 居中显示
    &--center {
        &.q-field {
            &--outlined {
                .q-field__control {
                    .q-field__native {
                        text-align: center;
                    }
                }
            }
        }
    }

    // 左边按钮
    &__left {
        margin-left: -8px;
    }

    // 右边按钮
    &__right {
        margin-right: -8px;
    }
}
</style>

