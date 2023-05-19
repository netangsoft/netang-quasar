<template>
    <div class="full-width">

        <q-chip
            class="q-ma-none"
            square
            :label="label"
            :clickable="false"
            :ripple="false"
        >
            <!-- 提示信息 -->
            <q-tooltip anchor="center right" self="center left" v-if="tooltip">{{tooltip}}</q-tooltip>
        </q-chip>

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
        label: [ String, Number ],
        // 提示信息
        tooltip: [ String, Number ],
    },
}
</script>
