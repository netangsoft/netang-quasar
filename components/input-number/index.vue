<template>
    <q-input
        class="n-input-number"
        v-model="currentValue"
        @update:model-value="onInput"
        @blur="onBlur"
        v-bind="inputProps"
    >
        <template #prepend>
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
        <template #append>
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

import inputProps from '../../props/quasar/input'
import { formatNumbers, addNumber } from './number'

// 自定义声明属性
const currentProps = {
    // 值
    modelValue: {
        required: false
    },
    // 最小值
    min: {
        type: [Number, String],
        default: 1,
    },
    // 最大值
    max: {
        type: [Number, String],
        default: Infinity,
    },
    // 初始值，当 v-model 为空时生效
    defaultValue: {
        type: [Number, String],
        default: 1,
    },
    // 步长，每次点击时改变的值
    step: {
        type: [Number, String],
        default: 1,
    },
    // 固定显示的小数位数
    decimalLength: [Number, String],
    // 是否只允许输入整数
    integer: {
        type: Boolean,
        default: true,
    },
    // 是否禁用步进器
    disabled: Boolean,
    // 是否禁用增加按钮
    disablePlus: Boolean,
    // 是否禁用减少按钮
    disableMinus: Boolean,
    // 是否禁用输入框
    disableInput: Boolean,
    // 是否开启异步变更，开启后需要手动控制输入值
    asyncChange: Boolean,
    // 是否显示增加按钮
    showPlus: {
        type: Boolean,
        default: true,
    },
    // 是否显示减少按钮
    showMinus: {
        type: Boolean,
        default: true,
    },
    // 是否允许输入的值为空
    allowEmpty: Boolean,
    // 显示文字
    showText: {
        type: Boolean,
        default: true,
    },
}

export default {

    /**
     * 标识
     */
    name: 'NInputNumber',

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

        // ==========【数据】============================================================================================

        // 输入框组件传参
        const inputProps = _.omit(props, Object.keys(currentProps))

        // 当前值
        const defaultValue = props.modelValue ?? props.defaultValue
        const value = format(defaultValue)
        if (! _.isEqual(value, props.modelValue)) {
            emit('update:modelValue', value)
        }
        const currentValue = ref(value)

        // ==========【计算属性】=========================================================================================

        /**
         * 是否禁用减少按钮
         */
        const minusDisabled = computed(function () {
            return props.disabled || props.disableMinus || currentValue.value <= +props.min
        })

        /**
         * 是否禁用增加按钮
         */
        const plusDisabled = computed(function () {
            return props.disabled || props.disablePlus || currentValue.value >= +props.max
        })

        // ==========【监听数据】=========================================================================================

        /**
         * 监听值
         */
        watch(()=>props.modelValue, function (val) {
            if (! _.isEqual(val, currentValue.value)) {
                currentValue.value = format(val)
            }
        })

        /**
         * 监听当前值
         */
        watch(currentValue, function (val) {
            emit('update:modelValue', val)
            emit('change', val)
        })

        /**
         * 监听其他
         */
        watch([()=>props.max, ()=>props.min, ()=>props.integer, ()=>props.decimalLength], function () {
            const val = format(currentValue.value)
            if (! _.isEqual(val, currentValue.value)) {
                currentValue.value = val
            }
        })

        // ==========【方法】=============================================================================================

        /**
         * 格式化数字
         */
        function formatNumber(value) {
            return formatNumbers(String(value), ! props.integer)
        }

        /**
         * 格式化
         */
        function format(value) {
            if (props.allowEmpty && value === '') {
                return value
            }

            value = formatNumber(value)

            // format range
            value = value === '' ? 0 : +value
            value = isNaN(value) ? props.min : value
            value = Math.max(Math.min(props.max, value), props.min)

            // 格式化小数位数
            if (! _.isNil(props.decimalLength)) {
                value = value.toFixed(props.decimalLength)
            }

            return value
        }

        /**
         * 输入触发
         */
        function onInput(value) {

            let formatted = formatNumber(value)

            // limit max decimal length
            if (! _.isNil(props.decimalLength) && formatted.indexOf('.') !== -1) {
                const pair = utils.split(formatted, '.')
                formatted = `${pair[0]}.${pair[1].slice(0, props.decimalLength)}`
            }

            // prefer number type
            if (formatted === String(+formatted)) {
                formatted = +formatted
            }

            emitChange(formatted)
        }

        /**
         * 失去焦点触发
         */
        function onBlur(value) {
            value = format(value)
            emitChange(value)
            emit('blur', value)
        }

        /**
         * 提交改变值
         */
        function emitChange(value) {

            // 是否开启异步变更，开启后需要手动控制输入值
            if (props.asyncChange) {
                emit('input', value)
                emit('change', value)
                return
            }

            currentValue.value = value
        }

        /**
         * 改变值
         */
        function onChange(type) {

            if (props[`${type}Disabled`]) {
                emit('overlimit', type)
                return
            }

            const diff = type === 'minus' ? -props.step : +props.step

            const value = format(addNumber(+currentValue.value, diff))

            emitChange(value)
            emit(type)
        }

        /**
         * 点击不可用的按钮时触发
         */
        function onOverlimit(type) {
            emit('overlimit', type)
        }

        // ==========【返回】=============================================================================================

        return {
            // 字段组件传参
            inputProps,
            // 当前值
            currentValue,

            // 是否禁用减少按钮
            minusDisabled,
            // 是否禁用增加按钮
            plusDisabled,

            // 输入触发
            onInput,
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

.n-input-number {
    &.q-field {
        &--outlined {
            .q-field__control {
                padding: 0 4px !important;
            }
        }
    }
}
</style>

