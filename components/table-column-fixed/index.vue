<template>
    <q-td :props="props">
        <div class="q-gutter-sm" v-if="tableFixedRoleBtnLists.length">
            <q-btn
                v-for="item in tableFixedRoleBtnLists"
                :key="`btn-item-${item.id}`"
                class="n-button-icon"
                :icon="item.icon"
                @click.prevent.stop="onClick(item)"
                unelevated
                round
            >
                <!-- 标题提示 -->
                <q-tooltip>{{item.title}}</q-tooltip>
            </q-btn>
        </div>
    </q-td>
</template>

<script>
import { inject } from 'vue'

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
        } = inject(NPowerKey)

        // 获取表格注入
        const {
            // 固定在右边的权限按钮列表
            tableFixedRoleBtnLists,
        } = inject(NTableKey)

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
            tableFixedRoleBtnLists,
            // 权限按钮点击
            onClick,
        }
    },
}
</script>
