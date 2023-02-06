<template>
    <q-img
        :src="currentSrc"
        :spinner-size="$n_px(size / 2)"
        :width="$n_px(size)"
        :height="$n_px(size)"
        fit="fill"
        v-if="currentSrc"
    >
        <!-- 预览点击 -->
        <div
            class="absolute-full transparent cursor-pointer"
            @click.prevent.stop="onPreview"
            @dblclick.prevent.stop="$n_noop"
            v-if="preview"
        ></div>
    </q-img>
</template>

<script>
import { computed } from 'vue'
import { useQuasar } from 'quasar'


export default {

    /**
     * 标识
     */
    name: 'NThumbnail',

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
        // 点击预览
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
        }
    }
}
</script>
