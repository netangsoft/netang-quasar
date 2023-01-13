<template>
    <q-field
        class="n-field-fieldset"
        :label="label"
        :stack-label="stackLabel"
        :outlined="outlined"
        :dense="dense"
        :readonly="readonly"
        v-bind="fieldProps"
    >
        <template v-slot:control>

            <!-- 如果有默认插槽 -->
            <template v-if="$slots.default">

                <!-- 否则如果开启复制 -->
                <div
                    class="full-width"
                    @click="onCopy"
                    v-if="copy"
                >
                    <slot
                        :value="value"
                    />
                </div>

                <!-- 否则仅展示 -->
                <div
                    class="full-width"
                    v-else
                >{{value}}</div>
            </template>

            <!-- 否则如果开启复制 -->
            <div
                class="full-width"
                @click="onCopy"
                v-else-if="copy"
            >{{value}}</div>

            <!-- 否则仅展示 -->
            <div
                class="full-width"
                v-else
            >{{value}}</div>

        </template>
    </q-field>
</template>

<script>
import { useFieldProps } from 'quasar/src/composables/private/use-field.js'

// 自定义声明属性
const currentProps = {
    // 标签
    label: [Array, String, Number],
    // 值
    value: [String, Number],
    // 复制文字
    copyText: [String, Number],
    // 标签始终显示在字段上方
    stackLabel: {
        type: Boolean,
        default: true,
    },
    // 线条
    outlined: {
        type: Boolean,
        default: true,
    },
    // 紧凑模式
    dense: {
        type: Boolean,
        default: true,
    },
    // 只读模式
    readonly: {
        type: Boolean,
        default: true,
    },
    // 复制
    copy: {
        type: Boolean,
        default: true,
    },
}

export default {

    /**
     * 标识
     */
    name: 'NFieldText',

    /**
     * 声明属性
     */
    props: {
        ...useFieldProps,

        // 自定义声明属性
        ...currentProps,
    },

    /**
     * 组合式
     */
    setup(props) {

        // ==========【数据】============================================================================================

        // 字段组件传参
        const fieldProps = _.omit(props, Object.keys(currentProps))

        // ==========【方法】=============================================================================================

        /**
         * 复制
         */
        function onCopy() {
            utils.copy(props.copyText || props.value, `复制【${props.label}】成功`)
        }

        // ==========【返回】=============================================================================================

        return {
            // 字段组件传参
            fieldProps,
            // 复制
            onCopy,
        }
    },
}
</script>
