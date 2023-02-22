<template>
    <q-select
        v-model="currentModelValue"
        :options="currentOptions"
        :option-label="optionLabel"
        :multiple="multiple"
        :use-input="filter"
        @filter="onFilter"
        v-bind="$attrs"
    >
        <!-- 占位符 -->
        <template v-slot:selected v-if="! showValue && placeholder">
            <div class="n-placeholder q-mr-xs">{{placeholder}}</div>
        </template>

        <!-- 插槽 -->
        <template
            v-for="slotName in slotNames"
            v-slot:[slotName]="props"
        >
            <!-- 有传参的插槽 -->
            <slot
                :name="slotName"
                v-bind="props"
                v-if="props"
            />

            <!-- 无传参的插槽 -->
            <slot
                :name="slotName"
                v-else
            />
        </template>
    </q-select>
</template>

<script>
import { ref, computed, watch } from 'vue'

import $n_isValidArray from '@netang/utils/isValidArray'
import $n_isValidObject from '@netang/utils/isValidObject'
import $n_collection from '@netang/utils/collection'

export default {

    /**
     * 标识
     */
    name: 'NSelect',

    /**
     * 声明属性
     */
    props: {
        // 值
        modelValue: {
            required: true,
        },
        options: {
            type: Array,
            default: () => []
        },
        // 选项标签
        optionLabel: {
            type: String,
            default: 'label',
        },
        // 是否多选
        multiple: Boolean,
        // 占位符
        placeholder: String,
        // 筛选
        filter: Boolean,
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

        // ==========【当前值】===========================================================================================

        // 当前值
        const currentModelValue = ref(props.modelValue)

        // 原始选项
        const rawOptions = props.options

        // 当前选项
        const currentOptions = ref(rawOptions)

        // ==========【计算属性】=========================================================================================

        /**
         * 插槽标识
         */
        const slotNames = computed(function() {
            return $n_isValidObject(slots) ? Object.keys(slots) : []
        })

        /**
         * 显示值
         */
        const showValue = computed(function() {

            // 如果是多选
            if (props.multiple) {
                return $n_isValidArray(currentModelValue.value) ? '1' : ''
            }

            return currentModelValue.value
        })


        // ==========【监听数据】=========================================================================================

        /**
         * 监听声明值
         */
        watch(()=>props.modelValue, function (val) {
            // 设置当前值
            currentModelValue.value = val
        })

        /**
         * 监听当前值
         */
        watch(currentModelValue, function (val) {
            // 更新值
            emit('update:modelValue', val)
        })

        // ==========【方法】============================================================================================

        /**
         * 筛选
         */
        function onFilter(value, update) {
            update(function() {
                // 更新选项
                currentOptions.value =
                    // 如果搜索值为空
                    value === '' ?
                        // 选项还原为初始值
                        rawOptions
                        // 否则筛选选项
                        : $n_collection(rawOptions)
                            .where(props.optionLabel, 'like', value)
                            .toArray()
            })
        }

        // ==========【返回】=============================================================================================

        return {
            // 插槽标识
            slotNames,
            // 当前值
            currentModelValue,
            // 当前选项
            currentOptions,
            // 显示值
            showValue,

            // 筛选
            onFilter,
        }
    }
}
</script>
