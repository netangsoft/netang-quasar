<template>
    <q-select

    >

    </q-select>
</template>

<script>
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
    setup(props, { emit }) {

        // ==========【当前值】===========================================================================================

        /**
         * 原始值
         */
        const rawModelValue = props.modelValue

        // ==========【方法】============================================================================================

        /**
         * 筛选
         */
        function filter(value, update) {
            update(function() {
                // 更新值
                emit(
                    'update:modelValue',
                    value === '' ? rawModelValue : utils.collection(rawModelValue)
                        .where(props.optionLabel, 'like', value)
                        .toArray()
                )
            })
        }

        // ==========【返回】=============================================================================================

        return {
            // 筛选
            filter,
        }
    }
}
</script>
