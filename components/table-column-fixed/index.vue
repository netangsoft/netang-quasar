<template>
    <div class="q-gutter-sm" v-if="currentTableFixedPowerBtns.length">
        <q-btn
            v-for="item in currentTableFixedPowerBtns"
            :key="`btn-item-${item.id}`"
            class="n-button-icon"
            :icon="item.icon"
            dense
            unelevated
            round
            @click.prevent.stop="onClick(item)"
        >
            <!-- 标题提示 -->
            <q-tooltip>{{item.title}}</q-tooltip>
        </q-btn>
    </div>
</template>

<script>
import { inject, computed } from 'vue'

import $n_cloneDeep from 'lodash/cloneDeep'
import $n_isFunction from 'lodash/isFunction'

import $n_forEach from '@netang/utils/forEach'

import { NPowerKey, NTableKey } from '../../utils/symbols'

export default {

    /**
     * 标识
     */
    name: 'NTableColumnFixed',

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

        // 获取权限注入
        const {
            // 权限按钮点击
            powerBtnClick,
            // 格式化权限按钮
            formatPowerBtns,
        } = inject(NPowerKey)

        // 获取表格注入
        const {
            // 固定在右边的权限按钮列表
            tableFixedPowerBtns,
        } = inject(NTableKey)

        // ==========【计算属性】=========================================================================================

        /**
         * 当前表格固定权限按钮
         */
        const currentTableFixedPowerBtns = computed(function () {

            const lists = []

            $n_forEach(tableFixedPowerBtns.value, function (item) {

                item = $n_cloneDeep(item)

                // 格式化权限按钮
                if (formatPowerBtns(item, true, [ props.props.row ]) === false || item.hidden === true) {
                    return
                }

                lists.push(item)
            })

            return lists
        })

        // ==========【方法】=============================================================================================

        /**
         * 点击
         */
        function onClick(item) {
            powerBtnClick(item, [ props.props.row ])
        }

        // ==========【返回】=============================================================================================

        return {
            // 固定在右边的权限按钮列表
            tableFixedPowerBtns,
            // 当前表格固定权限按钮
            currentTableFixedPowerBtns: $n_isFunction(formatPowerBtns) ? currentTableFixedPowerBtns : tableFixedPowerBtns,
            // 权限按钮点击
            onClick,
        }
    },
}
</script>
