<template>
    <q-select
        v-model="currentModelValue"
        :options="currentOptions"
        :option-label="optionLabel"
        :use-input="filter"
        @filter="onFilter"
        v-bind="$attrs"
    >
        <!-- 占位符 -->
        <template v-slot:selected v-if="! currentModelValue && placeholder">
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

        // ==========【计算属性】=========================================================================================

        /**
         * 插槽标识
         */
        const slotNames = computed(function() {
            return $n_isValidObject(slots) ? Object.keys(slots) : []
        })

        // ==========【当前值】===========================================================================================

        // 当前值
        const currentModelValue = ref(props.modelValue)

        // 原始选项
        const rawOptions = props.options

        // 当前选项
        const currentOptions = ref(rawOptions)

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

            // 筛选
            onFilter,
        }
    }
}
</script>
