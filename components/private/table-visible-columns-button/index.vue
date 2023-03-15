<template>
    <!-- 表格筛选可见列按钮-->
    <q-btn
        icon="checklist"
        dense
        round
        flat
        v-if="tableColumns.length"
    >
        <q-menu
            self="top middle"
            :offset="[0, 8]"
        >
            <q-list style="min-width: 250px" dense bordered>

                <!-- 表格宫格 -->
                <template v-if="tableGrid !== null">
                    <q-item
                        clickable
                        @click="tableGrid = ! tableGrid"
                    >
                        <q-item-section>宫格模式</q-item-section>
                        <q-item-section side>
                            <q-icon
                                size="xs"
                                name="check"
                                v-show="tableGrid"
                            />
                        </q-item-section>
                    </q-item>
                    <q-separator />
                </template>

                <!-- 筛选表格列 -->
                <q-item
                    v-for="item in tableColumns"
                    clickable
                    @click="onTableVisible(item)"
                >
                    <q-item-section>{{item.label}}</q-item-section>
                    <q-item-section side>
                        <q-icon
                            size="xs"
                            name="check"
                            v-show="indexOf(tableVisibleColumns, item.name) > -1"
                        />
                    </q-item-section>
                </q-item>
            </q-list>
        </q-menu>
    </q-btn>
</template>

<script>
import { inject, watch } from 'vue'

import $n_indexOf from '@netang/utils/indexOf'

import { NTableKey } from '../../../utils/symbols'

export default {

    /**
     * 组合式
     */
    setup() {

        // ==========【方法】=============================================================================================

        // 获取表格注入数据
        const {
            // 表格列数据(对象数组)
            tableColumns,
            // 表格可见列
            tableVisibleColumns,
            // 表格宫格
            tableGrid,
        } = inject(NTableKey)

        /**
         * 表格可见列点击
         */
        function onTableVisible(item) {
            const index = $n_indexOf(tableVisibleColumns.value, item.name)
            if (index > -1) {
                tableVisibleColumns.value.splice(index, 1)
            } else {
                tableVisibleColumns.value.push(item.name)
            }
        }

        // ==========【返回】=============================================================================================

        return {
            // 表格列数据(对象数组)
            tableColumns,
            // 表格可见列
            tableVisibleColumns,
            // 表格宫格
            tableGrid,

            // 表格可见列点击
            onTableVisible,

            indexOf: $n_indexOf,
        }
    },
}
</script>
