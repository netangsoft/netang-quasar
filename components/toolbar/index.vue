<template>
    <component
        :is="header ? QHeader : QFooter"
        class="n-toolbar"
        :dark="$q.dark.isActive"
        bordered
        v-if="show || toolbarPowerBtns.length"
    >
        <q-toolbar>

            <!-- 左边侧滑菜单切换按钮-->
            <q-btn
                :icon="leftDrawer.icon"
                dense
                round
                flat
                @click="leftDrawer.toggle"
                v-if="leftDrawer.showButton()"
            />

            <!-- 左边插槽 -->
            <slot name="left" />

            <!-- 中间权限按钮 -->
            <q-toolbar-title>
                <q-scroll-area style="height:50px;">
                    <div class="n-toolbar__body">

                        <!-- 权限按钮 -->
                        <template v-for="item in toolbarPowerBtns">
                            <q-btn
                                class="n-button-icon"
                                :color="item.color"
                                :outline="item.color === 'default'"
                                :label="item.title"
                                :icon="item.icon"
                                v-if="! item.hidden"
                                v-show="item.show"
                                @click="powerBtnClick(item, tableSelected)"
                                unelevated
                            />
                        </template>

                        <!-- 中间权限按钮插槽 -->
                        <slot />
                    </div>
                </q-scroll-area>
            </q-toolbar-title>

            <!-- 右边插槽 -->
            <slot name="right" />

            <!-- 表格筛选可见列按钮 -->
            <table-visible-columns-button v-if="hasTable" />

            <!-- 右边侧滑菜单切换按钮-->
            <q-btn
                :icon="rightDrawer.icon"
                dense
                round
                flat
                @click="rightDrawer.toggle"
                v-if="rightDrawer.showButton()"
            />

        </q-toolbar>
    </component>
</template>

<script>
import { inject } from 'vue'

import QHeader from 'quasar/src/components/header/QHeader'
import QFooter from 'quasar/src/components/footer/QFooter'

import TableVisibleColumnsButton from '../private/table-visible-columns-button'

import { NPowerKey, NTableKey } from '../../utils/symbols'

export default {

    /**
     * 标识
     */
    name: 'NToolbar',

    /**
     * 容器
     */
    components: {
        TableVisibleColumnsButton,
    },

    /**
     * 声明属性
     */
    props: {
        // 是否头部工具栏
        header: Boolean,
        // 是否强制显示
        show: Boolean,
    },

    /**
     * 组合式
     */
    setup() {

        // ==========【数据】============================================================================================

        // 获取权限注入数据
        const $power = inject(NPowerKey)

        // 获取表格注入数据
        const $table = inject(NTableKey)

        // ==========【返回】=============================================================================================

        return {
            // 解构权限实例
            ...$power,
            // 是否有表格
            hasTable: !! $table,

            QHeader,
            QFooter,
        }
    },
}
</script>

<style lang="scss">
.n-toolbar {
    &__body {
        .q-btn {
            margin-top: 7px;

            // 非第一个子节点
            &:not(:first-child) {
                margin-left: 7px;
            }
        }
    }
}
</style>
