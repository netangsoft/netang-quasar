<template>
    <q-header
        class="n-toolbar"
        :dark="$q.dark.isActive"
        bordered
        v-if="header"
    >
        <slot />
    </q-header>

    <q-footer
        class="n-toolbar"
        :dark="$q.dark.isActive"
        bordered
        v-else
    >
        <slot />
    </q-footer>
</template>

<script>
export default {
    /**
     * 声明属性
     */
    props: {
        // 是否头部
        header: Boolean,
    },
}
</script>
