<template>
    <div class="full-width">
        <q-badge
            :label="label"
            color="grey-7"
            outline
        >
            <!-- 提示信息 -->
            <q-tooltip anchor="center right" self="center left" v-if="tooltip">{{tooltip}}</q-tooltip>
        </q-badge>

        <!-- 插槽 -->
        <slot />
    </div>
</template>

<script>
export default {

    /**
     * 标识
     */
    name: 'NColumnTitle',

    /**
     * 声明属性
     */
    props: {
        // 标签
        label: [String, Number],
        // 提示信息
        tooltip: [String, Number],
    },
}
</script>
