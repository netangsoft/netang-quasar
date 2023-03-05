<template>
    <div
        class="q-pa-lg column flex-center q-gutter-sm"
        :class="{
            'absolute-full': fit,
        }"
    >
        <!-- 图标 -->
        <q-icon
            :name="icon"
            color="grey-5"
            :size="toPx(iconSize)"
        />

        <!-- 描述文字 -->
        <div
            :class="descriptionClass"
            v-if="description"
        >{{description}}</div>
    </div>
</template>

<script>
import $n_px from '@netang/utils/px'

export default {

    /**
     * 标识
     */
    name: 'NEmpty',

    /**
     * 声明属性
     */
    props: {
        // 图标
        icon: {
            type: String,
            default: 'info',
        },
        // 图标大小
        iconSize: {
            type: [ String, Number ],
            default: 70,
        },
        // 描述类名
        descriptionClass: {
            type: String,
            default: 'text-subtitle1 text-grey-7',
        },
        // 描述文字
        description: String,
        // 撑满全屏
        fit: Boolean,
    },

    /**
     * 组合式
     */
    setup() {

        // ==========【方法】=============================================================================================

        return {
            // 转像素
            toPx: $n_px,
        }
    }
}
</script>
