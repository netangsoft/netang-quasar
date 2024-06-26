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

        <!-- minio 标签 -->
        <span class="n-img-minio-tag" v-if="minioTag">{{minioTag}}</span>
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

        <!-- minio 标签 -->
        <span class="n-img-minio-tag" v-if="minioTag">{{minioTag}}</span>
    </div>
</template>

<script>
import { computed } from 'vue'

import $n_px from '@netang/utils/px'
import $n_indexOf from '@netang/utils/indexOf'

import $n_getImage from '../../utils/getImage'
import $n_previewImage from '../../utils/previewImage'

import { configs } from '../../utils/config'

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

        // 真实宽度
        // 用于 cdn 显示真实图片宽度
        realWidth: Number,
        // 图片参数
        options: Object,
        // cdn 自动缩放
        zoom: {
            type: Boolean,
            default: true,
        },
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

            if (props.src) {

                // 获取参数
                const options = {}

                // 宽度
                if (props.width) {
                    options.w = props.width
                }

                // 真实宽度
                if (props.realWidth) {
                    options.realWidth = props.realWidth
                }

                // 自动缩放
                if (props.zoom) {
                    options.zoom = true
                }

                return $n_getImage(props.src, Object.assign(options, props.options)) || ''
            }

            return ''
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

        /**
         * minio 标签
         */
        const {
            minioFileTag,
        } = configs.uploader
        const minioTag = computed(function () {
            return (
                minioFileTag
                && currentSrc.value
                && (
                    $n_indexOf(currentSrc.value, '_?') > -1
                    || currentSrc.value.slice(-1) === '_'
                )
            ) ? minioFileTag : ''
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
            // minio 标签
            minioTag,
            // 预览
            onPreview,
            // 点击空方法
            onNoop() {},
        }
    }
}
</script>

<style lang="scss">
@import "@/assets/sass/variables.scss";

.n-img {
    // 圆形
    &--round {
        border-radius: 50%;
    }

    // 设置
    &__settings {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        padding: 0 !important;
        margin: 0 !important;
        background-color: transparent !important;
        visibility: hidden;
    }

    &:hover {
        .n-img__settings {
            visibility: visible;
        }
    }

    // minio 标签
    &-minio-tag {
        position: absolute;
        right: -2px;
        bottom: -2px;
        padding: 1px 2px;
        border-radius: 3px;
        background-color: $primary;
        color: #ffffff;
        transform: scale(0.6);
        opacity: 0.8;
        pointer-events: none;
    }
}

/**
 * 手机版
 */
body.mobile {
    .n-img__settings {
        visibility: visible;
    }
}
</style>

