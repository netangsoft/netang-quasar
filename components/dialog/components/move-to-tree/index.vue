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
            :nodes="treeLists"
            :filter="treeFilter"
            node-key="id"
            v-model:expanded="treeExpanded"
            selected-color="primary"
            v-model:selected="treeSelected"
            no-selection-unset
        />
    </div>
</template>

<script>
import { ref, watch } from 'vue'

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
        const $dialog = utils.$dialog.inject()

        // ==========【数据】=============================================================================================

        // 树节点
        const treeRef = ref(null)

        // 树列表
        const treeLists = $dialog.props.data

        // 树筛选
        const treeFilter = ref('')

        // 树展开节点
        const treeExpanded = ref([0])

        // 树选择数据
        const treeSelected = ref({})

        // ==========【监听数据】==========================================================================================

        /**
         * 监听树选择数据
         */
        watch(treeSelected, function(val) {
            // 提交值
            $dialog.emit(val)
        })

        // ==========【返回】=============================================================================================

        return {
            // 树节点
            treeRef,
            // 树列表
            treeLists,
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
