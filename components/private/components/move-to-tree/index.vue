<template>
    <div class="q-pa-sm q-gutter-sm">

        <!-- 搜索框 -->
        <q-input
            v-model="treeFilter"
            placeholder="搜索"
            dense
            outlined
            clearable
        />

        <!-- 分类树 -->
        <q-tree
            ref="treeRef"
            color="grey-5"
            :nodes="treeNodes"
            :filter="treeFilter"
            :node-key="treeNodeKey"
            v-model:expanded="treeExpanded"
            selected-color="primary"
            v-model:selected="treeSelected"
            no-selection-unset
        />
    </div>
</template>

<script>
import { ref, isRef, watch, inject } from 'vue'

import $n_isValidArray from '@netang/utils/isValidArray'

import { NDialogKey } from '../../../../utils/symbols'

export default {

    /**
     * 标识
     */
    name: 'NMoveToTree',

    /**
     * 组合式
     */
    setup() {

        // ==========【注入】============================================================================================

        // 获取对话框注入数据
        const {
            // 提交数据
            submit,
            // 父级声明属性
            props,
        } = inject(NDialogKey)

        const {
            // 树节点列表
            nodes,
            // 树展开节点
            expanded,
            // 节点唯一键值
            nodeKey,

        } = Object.assign({
            nodeKey: 'id',
        }, props)

        // 对话框提交数据
        submit(onSubmit)

        // ==========【数据】=============================================================================================

        // 树节点
        const treeRef = ref(null)

        // 树节点列表
        const treeNodes = format(nodes)

        // 树节点唯一键值
        const treeNodeKey = ref(nodeKey)

        // 树筛选
        const treeFilter = ref('')

        // 树展开节点
        const treeExpanded = format(expanded)

        // 树选择数据
        const treeSelected = ref(0)

        // 当前选择值
        const currentValue = ref({})

        // ==========【监听数据】==========================================================================================

        /**
         * 监听树选择数据
         */
        watch(treeSelected, function(value) {
            // 设置当前选择值
            currentValue.value = {
                value,
                node: treeRef.value.getNodeByKey(value),
            }
        })

        // ==========【方法】=============================================================================================

        /**
         * 提交
         */
        function onSubmit() {
            return currentValue.value
        }

        /**
         * 格式化列表
         */
        function format(val) {

            if (val) {

                if (isRef(val)) {
                    return ref(val.value)
                }

                if ($n_isValidArray(val)) {
                    return ref(val)
                }
            }

            return ref([])
        }

        // ==========【返回】=============================================================================================

        return {
            // 树节点
            treeRef,
            // 树列表
            treeNodes,
            // 节点唯一键值
            treeNodeKey,
            // 树筛选
            treeFilter,
            // 树展开节点
            treeExpanded,
            // 树选择数据
            treeSelected,
        }
    }
}
</script>
