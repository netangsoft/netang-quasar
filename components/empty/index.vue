<template>
    <div class="q-pa-lg flex flex-center absolute-full">
        {{emptyDescription || '发生未知错误'}}
    </div>
</template>

<script>
export default {

    /**
     * 标识
     */
    name: 'NEmpty',

    /**
     * 声明属性
     */
    props: {
        // 空状态描述
        emptyDescription: String,
    },
}
</script>
