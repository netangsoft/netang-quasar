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
            v-if="tableRefresh"
        />
    </div>
</template>

<script>
export default {

    /**
     * 标识
     */
    name: 'NTablePagination',

    /**
     * 声明属性
     */
    props: {
        // 传值
        props: Object,
        // 表格刷新
        tableRefresh: Function,
    },
}
</script>
