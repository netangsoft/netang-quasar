<template>
    <q-tr class="q-table__bottom">
        <q-td
            v-for="(item, index) in columns"
            :class="item.css"
        >
            <!-- 合计标题 -->
            <span v-if="index === 0">合计</span>

            <!-- 合计数据 -->
            <span v-else-if="item.value">{{item.value}}</span>
        </q-td>
    </q-tr>
</template>

<script>
import { computed, inject } from 'vue'

import $n_has from 'lodash/has'
import $n_get from 'lodash/get'

import $n_forEach from '@netang/utils/forEach'

import $n_price from '../../utils/price'

import { NTableKey } from '../../utils/symbols'

export default {

    /**
     * 标识
     */
    name: 'NTableSummary',

    /**
     * 声明属性
     */
    props: {
        // 传值
        props: Object,
    },

    /**
     * 组合式
     */
    setup(props) {

        // ==========【数据】============================================================================================

        // 获取表格注入
        const {
            // 表格选择类型
            tableSelection,
            tableSummary,
        } = inject(NTableKey)

        // ==========【计算属性】============================================================================================

        const columns = computed(function () {

            const lists = []

            if (tableSelection.value !== 'none') {
                lists.push({
                    css: 'q-table--col-auto-width text-center',
                    name: '',
                })
            }

            $n_forEach($n_get(props.props, 'cols'), function(item) {

                const {
                    // 标识
                    name,
                    // 对齐方式
                    align,
                } = item

                const res = {
                    css: `text-${align}`,
                    name,
                    value: '',
                }

                // 如果有统计字段
                if ($n_has(tableSummary.value, name)) {
                    // 判断是否是价格
                    res.value = $n_has(item, 'price') ? $n_price(tableSummary.value[name]) : tableSummary.value[name]
                }

                lists.push(res)
            })

            return lists
        })

        // ==========【返回】=============================================================================================

        return {
            // 栏目
            columns,
            // 表格选择类型
            tableSelection,
        }
    },
}
</script>
