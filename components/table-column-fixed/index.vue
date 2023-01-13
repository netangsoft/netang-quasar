<template>
    <q-td :props="props">
        <div class="q-gutter-sm">
            <q-btn
                v-for="item in roleBtnLists"
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
import { NLayoutKey } from '../../utils/symbols'

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
        // 权限按钮列表
        roleBtnLists: Array,
    },

    /**
     * 组合式
     */
    setup(props) {

        // ==========【注入】============================================================================================

        // 获取布局注入数据
        const $nLayout = inject(NLayoutKey)

        // ==========【方法】=============================================================================================

        /**
         * 点击
         */
        function onClick(item) {
            $nLayout.data.role?.click(item, [ props.props.row ])
        }

        // ==========【返回】=============================================================================================

        return {
            // 点击
            onClick,
        }
    },
}
</script>
