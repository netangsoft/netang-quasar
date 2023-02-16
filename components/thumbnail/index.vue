<template>
    <q-img
        :src="currentSrc"
        :spinner-size="toPx(size / 2)"
        :width="toPx(size)"
        :height="toPx(size)"
        fit="fill"
        v-bind="$attrs"
        v-if="currentSrc"
    >
        <template v-slot:error>
            <div class="absolute-full flex flex-center bg-grey-5 text-white no-padding">
                <q-icon
                    :size="errorIconSize"
                    :name="errorIcon"
                />
            </div>
        </template>

        <!-- 预览点击 -->
        <div
            class="absolute-full transparent cursor-pointer"
            @click.prevent.stop="onPreview"
            @dblclick.prevent.stop="onNoop"
            v-if="preview"
        ></div>
    </q-img>

    <!-- 错误图标 -->
    <div
        class="flex flex-center bg-grey-5 text-white no-padding"
        :style="{
            width: toPx(size),
            height: toPx(size),
        }"
        v-else
    >
        <q-icon
            :size="errorIconSize"
            :name="errorIcon"
        />
    </div>
</template>

<script>
import { computed } from 'vue'
import { useQuasar } from 'quasar'

import $n_px from '@netang/utils/px'
import $n_noop from '@netang/utils/noop'

import $n_getImage from '../../utils/getImage'
import $n_previewImage from '../../utils/previewImage'

export default {

    /**
     * 标识
     */
    name: 'NThumbnail',

    /**
     * 关闭组件 attribute 透传行为
     */
    inheritAttrs: false,

    /**
     * 声明属性
     */
    props: {
        // 图片地址
        src: [String, Array, Object],
        // 图片尺寸
        size: {
            type: Number,
            default: 40,
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
    setup(props) {

        // ==========【数据】============================================================================================

        // quasar 对象
        const $q = useQuasar()

        // ==========【计算属性】==========================================================================================

        /**
         * 当前图片地址
         */
        const currentSrc = computed(function () {
            const res = $n_getImage(props.src, { w: $q.platform.is.mobile ? props.size * 2 : props.size })
            if (res) {
                return res
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
            // 预览
            onPreview,
            // 转像素
            toPx: $n_px,
            // 点击空方法
            onNoop: $n_noop,
        }
    }
}
</script>
