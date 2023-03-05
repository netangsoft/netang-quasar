<template>
    <slot :data="data" />
</template>

<script>
export default {
    /**
     * 标识
     */
    name: 'NData',

    /**
     * 传参
     */
    props: {
        // 数据
        data: {},
    },
}
</script>
