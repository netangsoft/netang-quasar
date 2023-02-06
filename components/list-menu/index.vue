<template>
    <q-list
        :dark="dark"
    >
        <n-list-menu-item
            :data="data"
            @item-click="onItemClick"
        />
    </q-list>
</template>

<script>
import { watch } from 'vue'

export default {

    /**
     * 标识
     */
    name: 'NListMenu',

    /**
     * 声明属性
     */
    props: {
        // 数据
        data: Array,
        // 是否暗色
        dark: Boolean,
        // 激活 key
        activeKey: {
            type: String,
            default: 'id',
        },
        // 激活值
        activeValue: [String, Number],
    },

    /**
     * 声明事件
     */
    emits: [
        // 单个元素点击
        'itemClick',
    ],

    /**
     * 组合式
     */
    setup(props, { emit }) {

        // ==========【方法】============================================================================================

        /**
         * 单个元素点击
         */
        function onItemClick(item) {
            emit('itemClick', item)
        }

        /**
         * 设置激活状态
         */
        function setActive() {

            const parentAll = {}

            // 获取父节点
            function getParent({ attr }) {
                if (
                    // 如果不是根节点
                    attr.pid
                    // 有父节点
                    && $n_has(parentAll, attr.pid)
                ) {
                    const parentItem = parentAll[attr.pid]

                    // 设为展开
                    parentItem.expanded = true

                    getParent(parentItem)
                }
            }

            // 获取子节点
            function getChildren(data) {

                for (const item of data) {

                    // 设为折叠
                    item.expanded = false

                    // 如果是父节点
                    if (item.children.length) {
                        parentAll[item.id] = item
                        getChildren(item.children)

                    // 否则如果是匹配的子节点
                    } else if (props.activeValue && item.attr[props.activeKey] === props.activeValue) {

                        // 设为展开
                        item.expanded = true

                        getParent(item)
                    }
                }
            }

            getChildren(props.data)
        }

        // ==========【监听数据】=========================================================================================

        /**
         * 监听声明值
         */
        watch([()=>props.data, ()=>props.activeValue], function() {

            // 设置激活状态
            if ($n_isValidArray(props.data)) {
                setActive()
            }

        }, {
            // 立即执行
            immediate: true,
        })

        // ==========【返回】=========================================================================================

        return {
            // 单个元素点击
            onItemClick,
        }
    }
}
</script>
