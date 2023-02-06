<template>
    <slot
        :click="onDialog"
    />
</template>

<script>
export default {

    /**
     * 标识
     */
    name: 'NDialogTable',

    /**
     * 声明属性
     */
    props: {
        // 值
        modelValue: [String, Number, Array, Object],
        // 标题
        title: String,
        // 路由组件路径
        route: String,
        // 宽
        width: {
            type: [Number, String],
            default: '80%',
        },
        // 组件传参
        props: Object,
        // 是否多选
        multiple: Boolean,
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

        // ==========【方法】=============================================================================================

        /**
         * 弹出对话框
         */
        function onDialog() {

            // 创建对话框
            $n.dialog.create({
                // 标题
                title: props.title,
                // 宽
                width: props.width,
                // width: 1000,
                // 路由组件路径
                route: props.route,
                // 组件传参
                props: Object.assign({
                    multiple: props.multiple,
                }, props.props),
                // 对话框传参
                dialogProps: {
                    // 不能通过按 ESC 键关闭对话框
                    noEscDismiss: true,
                    // 不能通过在对话框外单击来关闭对话框
                    noBackdropDismiss: true,
                },
                // 显示取消按钮
                cancel: true,
                // 点击确认执行
                async onConfirm(data) {
                     console.log('----data---', data)
                },
            })
        }

        // ==========【返回】=============================================================================================

        return {
            // 弹出对话框
            onDialog,
        }
    }
}
</script>
