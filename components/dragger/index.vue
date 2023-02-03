<template>
    <div
        class="n-dragger"
        :class="{
            dragging,
        }"
    >
        <slot
            :mousedown="mousedown"
            :fromIndex="fromIndex"
            :dragStart="dragStart"
            :dragEnter="dragEnter"
            :dragEnd="dragEnd"
        />
    </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {

    /**
     * 标识
     */
    name: 'NDragger',

    /**
     * 声明属性
     */
    props: {
        // 值
        modelValue: Array,
        // 是否开启拖拽
        drag: {
            type: Boolean,
            default: true,
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

        // ==========【数据】=============================================================================================

        // 是否拖拽中
        const dragging = ref(false)

        // 原始位置 index
        const fromIndex = ref(null)

        // 目标位置 index
        const toIndex = ref(null)

        // ==========【计算属性】=========================================================================================

        /**
         * 是否开启拖拽
         */
        const isDrag = computed(function() {
            return props.drag
                && $n.isValidArray(props.modelValue)
                && props.modelValue.length > 1
        })

        // ==========【方法】=============================================================================================

        /**
         * 鼠标点击事件
         */
        function mousedown() {
            // 如果开启拖拽
            if (isDrag.value) {
                // 设置拖拽中
                dragging.value = true
            }
        }

        /**
         * 拖拽开始
         * dragstart: 开始拖元素触发
         * dragenter: 当元素拖进可drop元素（绑定drop事件的元素）时触发
         * dragover: 当元素拖动到drop元素上时触发
         * drop: 当元素放下到drop元素触发
         * dragleave : 当元素离开drop元素时触发
         * drag: 每次元素被拖动时会触发
         * dragend: 放开拖动元素时触发
         */
        function dragStart(e, index) {

            // 如果开启拖拽
            if (isDrag.value) {

                // 如果为火狐浏览器, 则必须要setData
                // if ($n.ua.firefox) {
                //     e.dataTransfer.setData('info', e.target.id)
                // }

                // 设置拖拽中
                dragging.value = true

                // 设置原始位置 index
                fromIndex.value = index
            }
        }

        /**
         * 拖拽中
         */
        function dragEnter(e, index) {

            // 如果开启拖拽
            if (isDrag.value) {

                // 设置目标位置 index
                toIndex.value = index

                // 如果拖拽中
                if (dragging.value) {

                    // 为需要移动的元素设置 dragstart 事件
                    // e.dataTransfer.effectAllowed = 'move'

                    // 原始位置 index
                    const from = fromIndex.value
                    // 目标位置 index
                    const to = toIndex.value

                    // 如果原始位置 === 目标位置
                    if (from === to) {
                        // 则无任何操作
                        return
                    }

                    const val = [...props.modelValue]

                    // 如果当前元素在拖动目标位置的下方, 先将当前元素从数组拿出, 数组长度-1, 我们直接给数组拖动目标位置的地方新增一个和当前元素值一样的元素,
                    // 我们再把数组之前的那个拖动的元素删除掉, 所以要len+1
                    if (from > to) {
                        val.splice(to, 0, val[from])
                        val.splice(from + 1, 1)

                    } else {
                        // 如果当前元素在拖动目标位置的上方, 先将当前元素从数组拿出, 数组长度-1, 我们直接给数组拖动目标位置+1的地方新增一个和当前元素值一样的元素,
                        // 这时, 数组len不变, 我们再把数组之前的那个拖动的元素删除掉, 下标还是from
                        val.splice(to + 1, 0, val[from])
                        val.splice(from, 1)
                    }

                    fromIndex.value = to
                    toIndex.value = from

                    // 更新值
                    emit('update:modelValue', val)
                }
            }
        }

        /**
         * 拖拽结束
         */
        function dragEnd() {

            // 如果开启拖拽
            if (isDrag.value) {
                fromIndex.value = null
                toIndex.value = null
                dragging.value = false
            }
        }

        // ==========【返回】=============================================================================================

        return {
            // 是否拖拽中
            dragging,
            // 原始位置 index
            fromIndex,
            // 目标位置 index
            toIndex,

            // 鼠标点击事件
            mousedown,
            // 拖拽开始
            dragStart,
            // 拖拽中
            dragEnter,
            // 拖拽结束
            dragEnd,
        }
    },
}
</script>
