<template>
    <div>
        <!-- 页码 -->
        <span class="q-table__bottom-item">{{props.pagination.page}} / {{props.pagesNumber}}</span>

        <!-- 第一页 -->
        <q-btn
            v-if="props.pagesNumber > 2"
            :class="{ dense }"
            icon="first_page"
            color="grey-8"
            round
            dense
            flat
            :disable="props.isFirstPage"
            @click="props.firstPage"
        />

        <!-- 上页 -->
        <q-btn
            :class="{ dense }"
            icon="chevron_left"
            color="grey-8"
            round
            dense
            flat
            :disable="props.isFirstPage"
            @click="props.prevPage"
        />

        <!-- 下页 -->
        <q-btn
            :class="{ dense }"
            icon="chevron_right"
            color="grey-8"
            round
            dense
            flat
            :disable="props.isLastPage"
            @click="props.nextPage"
        />

        <!-- 最后一页 -->
        <q-btn
            :class="{ dense }"
            v-if="props.pagesNumber > 2"
            icon="last_page"
            color="grey-8"
            round
            dense
            flat
            :disable="props.isLastPage"
            @click="props.lastPage"
        />

        <!-- 刷新 -->
        <q-btn
            :class="{ dense }"
            icon="refresh"
            color="grey-8"
            round
            dense
            flat
            @click="tableRefresh"
            v-if="! noRefresh && hasRefresh"
        />

        <!-- 当前页面工具栏无权限按钮时显示 -->
        <template v-if="! noPower && ! toolbarPowerBtns.length">

            <!-- 左边侧滑菜单切换按钮-->
            <q-btn
                :class="{ dense }"
                :icon="leftDrawer.icon"
                dense
                round
                flat
                @click="leftDrawer.toggle"
                v-if="leftDrawer.showButton()"
            />

            <!-- 表格筛选可见列按钮 -->
            <table-visible-columns-button
                :class="{ dense }"
                v-if="hasTable"
            />

            <!-- 右边侧滑菜单切换按钮-->
            <q-btn
                :class="{ dense }"
                :icon="rightDrawer.icon"
                dense
                round
                flat
                @click="rightDrawer.toggle"
                v-if="rightDrawer.showButton()"
            />

        </template>

    </div>
</template>

<script>
import { inject } from 'vue'

import TableVisibleColumnsButton from '../private/table-visible-columns-button'
import { NPowerKey, NTableKey } from '../../utils/symbols'

export default {

    /**
     * 标识
     */
    name: 'NTablePagination',

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
        // 传值
        props: Object,
        // 是否关闭权限
        noPower: Boolean,
        // 是否关闭刷新按钮
        noRefresh: Boolean,
        // 紧凑模式
        dense: Boolean,
    },

    /**
     * 组合式
     */
    setup() {

        // ==========【数据】============================================================================================

        // 获取权限注入
        const $power = inject(NPowerKey)
        const {
            // 左边侧滑菜单数据
            leftDrawer,
            // 右边侧滑菜单数据
            rightDrawer,
            // 当前页面工具栏权限按钮
            toolbarPowerBtns,
        } = $power

        // 获取表格注入
        const $table = inject(NTableKey)
        const hasTable = !! $table

        const {
            // 表格刷新
            tableRefresh,
        } = $table

        // ==========【返回】=============================================================================================


        return {
            // 是否有表格
            hasTable,
            // 是否有刷新按钮
            hasRefresh: hasTable && !! $table.routeFullPath,
            // 表格刷新
            tableRefresh,
            // 当前页面工具栏权限按钮
            toolbarPowerBtns,
            // 左边侧滑菜单数据
            leftDrawer,
            // 右边侧滑菜单数据
            rightDrawer,
        }
    },
}
</script>

<style lang="scss" scoped>

// 紧凑模式
.dense {
    font-size: 12px;
}
</style>
