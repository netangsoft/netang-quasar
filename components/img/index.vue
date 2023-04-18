<template>
    <q-img
        class="n-img"
        :class="{
            'rounded-borders': rounded,
            'n-img--round': round,
        }"
        :src="currentSrc"
        :width="imageProps.width"
        :height="imageProps.height"
        :spinner-size="imageProps.spinnerSize"
        v-bind="$attrs"
        v-if="currentSrc"
    >
        <!-- 错误插槽 -->
        <template v-slot:error>
            <slot name="error">
                <div class="absolute-full flex flex-center bg-grey-5 text-white no-padding">
                    <q-icon
                        :size="errorIconSize"
                        :name="errorIcon"
                    />
                </div>

                <!-- 默认插槽 -->
                <slot />
            </slot>
        </template>

        <!-- 默认插槽 -->
        <slot />

        <!-- 预览点击 -->
        <div
            class="absolute-full transparent cursor-pointer"
            @click.prevent.stop="onPreview"
            @dblclick.prevent.stop="onNoop"
            v-if="preview"
        ></div>
    </q-img>

    <!-- 如果没有图片 -->
    <div
        class="q-img n-img"
        :class="{
            'rounded-borders': rounded,
            'n-img--round': round,
        }"
        :style="imageProps"
        v-bind="$attrs"
        v-else
    >
        <div class="q-img__content absolute-full q-anchor--skip">
            <slot name="error">
                <div class="absolute-full flex flex-center bg-grey-5 text-white no-padding">
                    <q-icon
                        :size="errorIconSize"
                        :name="errorIcon"
                    />
                </div>

                <!-- 默认插槽 -->
                <slot />
            </slot>
        </div>
    </div>
</template>

<script>
import { computed } from 'vue'

import $n_px from '@netang/utils/px'

import $n_getImage from '../../utils/getImage'
import $n_previewImage from '../../utils/previewImage'

export default {

    /**
     * 标识
     */
    name: 'NImg',

    /**
     * 关闭组件 attribute 透传行为
     */
    inheritAttrs: false,

    /**
     * 声明属性
     */
    props: {
        // 图片地址
        src: [ String, Array, Object ],
        // 宽
        width: [ String, Number ],
        // 高
        height: [ String, Number ],
        // 是否为圆形
        round: Boolean,
        // 是否为圆角
        rounded: Boolean,
        // 加载旋转器尺寸
        spinnerSize: [ String, Number ],
        // 错误尺寸(发生错误后如果没有定义宽高, 则此参数为宽高)
        errorSize: {
            type: [ String, Number ],
            default: 70,
        },
        // 错误图标大小
        errorIconSize: {
            type: String,
            default: 'md',
        },
        // 错误图标
        errorIcon: {
            type: String,
            default: 'image',
        },
        // 是否点击放大预览
        preview: Boolean,
        // 预览参数
        previewProps: Object,
    },

    /**
     * 组合式
     */
    setup(props) {

        // ==========【计算属性】==========================================================================================

        /**
         * 当前图片地址
         */
        const currentSrc = computed(function () {
            console.log('---props.src', props.src)
            const res = $n_getImage(props.src, { w: props.width, zoom: true })
            if (res) {
                return res
            }
        })

        /**
         * 图片声明属性
         */
        const imageProps = computed(function () {

            let width = props.width ? $n_px(props.width) : undefined
            let height = props.height ? $n_px(props.height) : undefined

            // 如果有当前值
            if (currentSrc.value) {
                return {
                    width,
                    height,
                    spinnerSize: props.spinnerSize ? $n_px(props.spinnerSize) : undefined,
                }
            }

            // 如果没有宽 || 没有高
            if (! width || ! height) {
                width = $n_px(props.errorSize)
                height = width
            }

            return {
                width,
                height,
            }
        })

        // ==========【方法】=============================================================================================

        /**
         * 预览
         */
        function onPreview() {

            // 预览图片
            $n_previewImage(Object.assign({
                images: [
                    props.src,
                ],
            }, props.previewProps))
        }

        // ==========【返回】=============================================================================================

        return {
            // 当前图片地址
            currentSrc,
            // 图片声明属性
            imageProps,
            // 预览
            onPreview,
            // 点击空方法
            onNoop() {},
        }
    }
}
</script>

<style lang="scss">
.n-img {
    // 圆形
    &--round {
        border-radius: 50%;
    }
}
</style>

