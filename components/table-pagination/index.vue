<template>
    <div>
        <!-- 页码 -->
        <span class="q-table__bottom-item">{{props.pagination.page}} / {{Math.ceil(props.pagination.rowsNumber / props.pagination.rowsPerPage)}}</span>

        <!-- 第一页 -->
        <q-btn
            v-if="props.pagesNumber > 2"
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
            icon="refresh"
            color="grey-8"
            round
            dense
            flat
            @click="tableRefresh"
            v-if="hasTable"
        />

        <!-- 当前页面工具栏无权限按钮时显示 -->
        <template v-if="! toolbarPowerBtns.length">

            <!-- 左边侧滑菜单切换按钮-->
            <q-btn
                :icon="leftDrawer.icon"
                dense
                round
                flat
                @click="leftDrawer.toggle"
                v-if="leftDrawer.showButton()"
            />

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
        const {
            // 表格刷新
            tableRefresh,
        } = $table

        // ==========【返回】=============================================================================================

        return {
            // 是否有表格
            hasTable: !! $table,
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
