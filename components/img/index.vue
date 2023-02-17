<template>
    <q-img
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
        class="q-img"
        v-bind="imageProps"
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
            </slot>
        </div>
    </div>
</template>

<script>
import { computed } from 'vue'

import $n_get from 'lodash/get'
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
        // 加载旋转器尺寸
        spinnerSize: [ String, Number ],
        // 错误尺寸
        errorSize: {
            type: [ String, Number ],
            default: 70,
        },
        // 错误图标大小
        errorIconSize: {
            type: String,
            default: 'sm',
        },
        // 错误图标
        errorIcon: {
            type: String,
            default: 'image',
        },
        // 是否点击放大预览
        preview: Boolean,
    },

    /**
     * 组合式
     */
    setup(props, { attrs }) {

        // ==========【计算属性】==========================================================================================

        /**
         * 当前图片地址
         */
        const currentSrc = computed(function () {
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
                class: $n_get(attrs, 'class'),
                style: [
                    {
                        width,
                        height,
                    },
                    $n_get(attrs, 'style'),
                ],
            }
        })

        // ==========【方法】=============================================================================================

        /**
         * 预览
         */
        function onPreview() {
            // 预览图片
            $n_previewImage(props.src)
        }

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
