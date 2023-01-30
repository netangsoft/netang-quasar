<template>
    <q-layout
        class="absolute-full"
        :class="{
            'n-table--grid': tableGrid,
        }"
        view="lHr LpR lff"
        container
    >
        <!-- 头部 -->
        <n-toolbar
            :dense="dense"
            header
        >
            <!-- 插槽 -->
            <template
                v-for="slotName in slotNames.toolbar"
                v-slot:[slotName]
            >
                <slot :name="`toolbar-${slotName}`"/>
            </template>
        </n-toolbar>

        <!-- 左侧分类 -->
        <slot name="left-drawer" v-if="slotNames.leftDrawer" />
        <n-drawer
            :model-value="! hideLeftDrawer"
            :side="treeSide"
            :width="200"
            :min-width="150"
            bordered
            drag
            cache
            v-bind="leftDrawerProps"
            v-else-if="treeNodes.length"
        >
            <q-scroll-area class="absolute-full">

                <!-- 树筛选 -->
                <div class="q-pa-sm q-gutter-sm" v-if="treeFilter">
                    <q-input
                        v-model="treeFilterValue"
                        placeholder="搜索"
                        dense
                        outlined
                        clearable

                    />
                </div>

                <!-- 分类树 -->
                <q-tree
                    color="grey-5"
                    ref="treeRef"
                    :nodes="treeNodes"
                    :filter="treeFilterValue"
                    :node-key="treeNodeKey"
                    :label-key="treeLabelKey"
                    selected-color="primary"
                    v-model:selected="treeSelected"
                    no-selection-unset
                    default-expand-all
                    v-bind="treeProps"
                />

            </q-scroll-area>
        </n-drawer>

        <!-- 列表 -->
        <q-page-container>
            <q-page>
                <q-table
                    class="n-table absolute-full"
                    :class="{
                        'n-table--last-fixed': showTableFixed,
                    }"
                    v-model:pagination="tablePagination"
                    v-model:selected="tableSelected"
                    :row-key="tableRowKey"
                    :rows="tableRows"
                    :columns="tableColumns"
                    :visible-columns="tableVisibleColumns"
                    :selection="tableSelection"
                    :separator="tableSeparator"
                    :loading="tableLoading"
                    :rows-per-page-options="tableRowsPerPageOptions"
                    :grid="tableGrid"
                    @row-click="tableRowClick"
                    @row-dblclick="currentTableRowDblclick"
                    @request="tableRequest"
                    flat
                    virtual-scroll
                    :dense="dense"
                    v-bind="tableProps"
                >
                    <!-- 图片 -->
                    <template
                        v-for="imgName in tableImgNames"
                        v-slot:[`body-cell-${imgName}`]="props"
                    >
                        <q-td :props="props">
                            <!-- 缩略图 -->
                            <n-thumbnail
                                :src="props.row[imgName]"
                                preview
                            />
                        </q-td>
                    </template>

                    <!-- 插槽 -->
                    <template
                        v-for="slotName in slotNames.table"
                        v-slot:[slotName]="props"
                    >
                        <q-td :props="props">
                            <slot
                                :name="slotName"
                                v-bind="props"
                            />
                        </q-td>
                    </template>

                    <!-- 操作 -->
                    <template v-slot:body-cell-settings="props">
                        <n-table-column-fixed
                            :props="props"
                        />
                    </template>

                    <!-- 合计 -->
                    <template v-slot:bottom-row="props" v-if="tableSummary">
                        <n-table-summary
                            :props="props"
                        />
                    </template>

                    <!-- 翻页 -->
                    <template v-slot:pagination="props">
                        <n-table-pagination
                            :props="props"
                        />
                    </template>
                </q-table>
            </q-page>
        </q-page-container>

        <!-- 右侧搜索 -->
        <slot name="right-drawer" v-if="slotNames.rightDrawer" />
        <n-drawer
            :model-value="! hideRightDrawer"
            :side="searchSide"
            :min-width="320"
            bordered
            drag
            cache
            v-bind="rightDrawerProps"
            v-else-if="! noSearch && tableSearchValue.length"
        >
            <!-- 搜索 -->
            <n-search
                v-model="tableSearchValue"
                :options="tableSearchOptions"
                :on-search="tableReload"
                :on-reset="tableSearchReset"
            >
                <!-- 插槽 -->
                <template
                    v-for="slotName in slotNames.search"
                    v-slot:[slotName]
                >
                    <slot :name="`search-${slotName}`"/>
                </template>
            </n-search>
        </n-drawer>

    </q-layout>
</template>

<script>
import { ref, watch, computed, inject } from 'vue'

import { NDialogKey, NTableKey } from '../../utils/symbols'

export default {

    /**
     * 标识
     */
    name: 'NTable',

    /**
     * 声明属性
     */
    props: {
        // 表格请求地址
        url: String,
        // 表格声明属性
        tableProps: Object,
        // 树声明属性
        treeProps: Object,
        // 树节点唯一键值
        treeNodeKey: {
            type: String,
            default: 'id',
        },
        // 树标签键值
        treeLabelKey: {
            type: String,
            default: 'title',
        },
        // 树节点列表
        treeNodes: {
            type: Array,
            default: ()=>[],
        },
        // 树节点点击
        treeNodeClick: Function,
        // 显示树筛选
        treeFilter: Boolean,
        // 树位置
        treeSide: {
            type: String,
            default: 'left',
        },
        // 不显示搜索
        noSearch: Boolean,
        // 搜索位置
        searchSide: {
            type: String,
            default: 'right',
        },
        // 紧凑模式
        dense: {
            type: Boolean,
            default: true,
        },
        // 隐藏左边侧滑菜单
        hideLeftDrawer: Boolean,
        // 左边侧滑菜单声明属性
        leftDrawerProps: Object,
        // 隐藏右边侧滑菜单
        hideRightDrawer: Boolean,
        // 右边侧滑菜单声明属性
        rightDrawerProps: Object,
    },

    /**
     * 组合式
     */
    setup(props, { slots }) {

        // ==========【数据】============================================================================================

        // 获取表格注入
        const $table = inject(NTableKey)

        // 获取对话框注入
        const $dialog = inject(NDialogKey)
        const inDialog = !! $dialog

        // 当前双击表格行
        let currentTableRowDblclick

        // 如果在对话框内部
        if (inDialog) {
            // 提交表格已选数据给对话框
            $dialog.submit(() => $table.tableSelected.value)

            // 对话框中的表格双击表格行
            currentTableRowDblclick = function (e, row) {
                // 如果不是多选
                if ($table.tableSelection.value !== 'multiple') {
                    $table.tableSelected.value = [ row ]
                    $dialog.confirm()
                }
            }

        } else {
            // 表格实例中的双击表格行
            currentTableRowDblclick = $table.tableRowDblclick
        }

        // 树节点
        const treeRef = ref(null)

        // 树筛选值
        const treeFilterValue = ref('')

        // 树选择数据
        const treeSelected = ref('')

        // ==========【计算属性】==========================================================================================

        /**
         * 插槽标识
         */
        const slotNames = computed(function() {

            const toolbar = []
            const search = []
            const table = []
            let leftDrawer = false
            let rightDrawer = false

            // 如果有插槽
            if (utils.isValidObject(slots)) {
                for (const key in slots) {
                    if (key.startsWith('toolbar-')) {
                        toolbar.push(key.replace('toolbar-', ''))
                    } else if (key.startsWith('search-')) {
                        search.push(key.replace('search-', ''))
                    } else if (key === 'left-drawer') {
                        leftDrawer = true
                    } else if (key === 'right-drawer') {
                        rightDrawer = true
                    } else {
                        table.push(key)
                    }
                }
            }

            return {
                toolbar,
                search,
                table,
                leftDrawer,
                rightDrawer,
            }
        })

        // ==========【监听数据】=========================================================================================

        /**
         * 监听树选择数据
         */
        if (_.isFunction(props.treeNodeClick)) {
            watch(treeSelected, function(nodeKey) {

                // 树节点点击
                const res = props.treeNodeClick({
                    nodeKey,
                    node: treeRef.value.getNodeByKey(nodeKey),
                    $table
                })

                if (! _.isNil(res)) {

                    if (res === false) {
                        return
                    }

                    if (utils.isValidObject(res)) {

                        // 设置表格传参
                        $table.tableQuery.value = res

                        // 表格重新加载
                        $table.tableReload()
                    }
                }
            })
        }

        // ==========【返回】=============================================================================================

        return {
            // 解构表格实例
            ...$table,

            // 树节点
            treeRef,
            // 树筛选值
            treeFilterValue,
            // 树选择数据
            treeSelected,

            // 插槽 body 单元格标识
            slotNames,

            // 当前双击表格行
            currentTableRowDblclick,
        }
    },
}
</script>
