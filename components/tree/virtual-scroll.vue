<template>
    <!-- 如果为自定义虚拟滚动 -->
    <virtual-scroll
        v-bind="$attrs"
        v-slot="props"
        v-if="isNVirtualScroll"
    >
        <slot v-bind="props" />
    </virtual-scroll>

    <!-- 否则为 quasar 虚拟滚动 -->
    <q-virtual-scroll
        v-bind="$attrs"
        v-slot="props"
        v-else
    >
        <slot v-bind="props" />
    </q-virtual-scroll>
</template>

<script>
import VirtualScroll from '../virtual-scroll'

export default {

    /**
     * 组件
     */
    components: {
        VirtualScroll,
    },

    /**
     * 声明属性
     */
    props: {
        // 是否为自定义虚拟滚动
        isNVirtualScroll: Boolean,
    },
}
</script>
