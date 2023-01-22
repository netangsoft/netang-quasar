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
        <n-toolbar header />

        <!-- 左侧分类 -->
        <n-drawer
            :model-value="true"
            side="left"
            :width="200"
            :min-width="150"
            bordered
            drag
            cache
            v-if="treeNodes.length"
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
                />

            </q-scroll-area>
        </n-drawer>

        <!-- 列表 -->
        <q-page-container>
            <q-page>
                <q-table
                    ref="tableRef"
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
                    :loading="tableLoading"
                    :rows-per-page-options="tableRowsPerPageOptions"
                    :grid="tableGrid"
                    @row-click="tableRowClick"
                    @row-dblclick="tableRowDblclick"
                    @request="tableRequest"
                    flat
                    virtual-scroll
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
                        v-for="slotName in slotNames"
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
        <n-drawer
            :model-value="true"
            side="right"
            :min-width="320"
            bordered
            drag
            cache
            v-if="! noSearch && tableSearchValue.length"
        >
            <!-- 搜索 -->
            <n-search
                v-model="tableSearchValue"
                :options="tableSearchOptions"
                :on-search="tableReload"
                :on-reset="tableSearchReset"
            />
        </n-drawer>
    </q-layout>
</template>

<script>
import { ref, watch, computed, inject } from 'vue'

import { NPowerKey, NTableKey } from '../../utils/symbols'

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
        // 不显示搜索
        noSearch: Boolean,
    },

    /**
     * 组合式
     */
    setup(props, { slots }) {

        // ==========【数据】============================================================================================

        // 获取权限注入
        const $power = inject(NPowerKey)

        const $table = inject(NTableKey)

        // 树节点
        const treeRef = ref(null)

        // 树筛选值
        const treeFilterValue = ref('')

        // 树选择数据
        const treeSelected = ref('')

        // 当前请求地址
        // const currentUrl = ref(props.url ? props.url : useRoute().fullPath)

        // // 表格参数
        // const tableParams = Object.assign({}, props.tableParams, {
        //     // 请求地址
        //     url: currentUrl.value,
        // })
        //
        // // 如果不显示搜索
        // if (props.noSearch) {
        //     tableParams.search = false
        // }

        // ==========【计算属性】==========================================================================================

        /**
         * 插槽标识
         */
        const slotNames = computed(function() {
            if (utils.isValidObject(slots)) {
                return Object.keys(slots)
            }
            return []
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
            // 解构权限实例
            ...$power,
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
        }
    },
}
</script>
