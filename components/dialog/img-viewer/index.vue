<template>
    <q-dialog
        class="n-img-viewer"
        ref="dialogRef"
        v-model="currentModelValue"
        :no-backdrop-dismiss="noBackdropDismiss"
        transition-show="fade"
        transition-hide="fade"
        maximized
        v-bind="$attrs"
        @hide="onDialogHide"
    >
        <div class="absolute-full" @click.self="onMask">

            <!-- 关闭 -->
            <q-btn
                class="n-img-viewer__btn n-img-viewer__btn--close cursor-pointer"
                :icon="closeIcon"
                round
                @click="onDialogCancel"
                unelevated
                :ripple="false"
            />

            <!-- 翻页按钮 -->
            <template v-if="! isSingle">

                <!-- 上一张按钮 -->
                <q-btn
                    class="n-img-viewer__btn n-img-viewer__btn--prev cursor-pointer"
                    :icon="prevIcon"
                    round
                    @click="prev"
                    unelevated
                    :ripple="false"
                />

                <!-- 下一张按钮 -->
                <q-btn
                    class="n-img-viewer__btn n-img-viewer__btn--next cursor-pointer"
                    :icon="nextIcon"
                    round
                    @click="next"
                    unelevated
                    :ripple="false"
                />
            </template>

            <!-- 操作面板 -->
            <div class="n-img-viewer__btn n-img-viewer__settings">
                <div class="n-img-viewer__settings__inner">

                    <!-- 缩小 -->
                    <q-icon
                        class="cursor-pointer"
                        :name="zoomOutIcon"
                        @click="handleActions('zoomOut')"
                    />

                    <!-- 放大 -->
                    <q-icon
                        class="cursor-pointer"
                        :name="zoomInIcon"
                        @click="handleActions('zoomIn')"
                    />

                    <!-- 切换比例 -->
                    <q-icon
                        class="cursor-pointer"
                        :name="isContain ? fullscreenIcon : exitFullscreenIcon"
                        @click="toggleMode"
                    />

                    <!-- 水平反转 -->
                    <q-icon
                        class="cursor-pointer"
                        :name="flipHorizontalIcon"
                        @click="handleActions('flipX')"
                    />

                    <!-- 垂直反转 -->
                    <q-icon
                        class="cursor-pointer"
                        :name="flipVerticalIcon"
                        @click="handleActions('flipY')"
                    />

                    <!-- 左旋转 -->
                    <q-icon
                        class="cursor-pointer"
                        :name="rotateLeftIcon"
                        @click="handleActions('anticlockwise')"
                    />

                    <!-- 右旋转 -->
                    <q-icon
                        class="cursor-pointer"
                        :name="rotateRightIcon"
                        @click="handleActions('clockwise')"
                    />

                </div>
            </div>


            <!-- 图片列表(有点击事件) -->
            <template v-if="isClickImg">
                <div
                    v-for="(src, i) in currentImages"
                    :key="`${src}-${i}`"
                    class="non-selectable no-outline"
                    @click="onClickImg({ src })"
                >
                    <img
                        :ref="(el) => (imgRefs[i] = el)"
                        :src="src"
                        :style="imgStyle"
                        @load="handleImgLoad"
                        @error="handleImgError"
                        v-show="i === activeIndex"
                    />
                </div>
            </template>
            <!-- 图片列表(点击跳转原图) -->
            <template v-else>
                <a
                    v-for="(src, i) in currentImages"
                    :key="`${src}-${i}`"
                    :href="src"
                    target="_blank"
                    class="non-selectable no-outline"
                >
                    <img
                        :ref="(el) => (imgRefs[i] = el)"
                        :src="src"
                        :style="imgStyle"
                        @load="handleImgLoad"
                        @error="handleImgError"
                        v-show="i === activeIndex"
                    />
                </a>
            </template>

        </div>
    </q-dialog>
</template>

<script>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useDialogPluginComponent } from 'quasar'

import $n_get from 'lodash/get'

import $n_forEach from '@netang/utils/forEach'
import $n_run from '@netang/utils/run'

import $n_getImage from '../../../utils/getImage'

import { configs } from '../../../utils/config'

export default {

    /**
     * 标识
     */
    name: 'NDialog',

    /**
     * 声明属性
     */
    props: {
        // 值
        modelValue: {
            type: Boolean,
            default: true,
        },
        noBackdropDismiss: Boolean,

        // 需要预览的图片 URL 数组
        images: {
            type: Array,
            default: () => [],
        },
        // 图片预览起始位置索引
        startPosition: {
            type: Number,
            default: 0,
        },
        infinite: {
            type: Boolean,
            default: true,
        },
        zoomRate: {
            type: Number,
            default: 1.2,
        },
        // 关闭图标
        closeIcon: {
            type: String,
            default: 'close',
        },
        // 上一张图标
        prevIcon: {
            type: String,
            default: 'arrow_back_ios_new',
        },
        // 下一张图标
        nextIcon: {
            type: String,
            default: 'arrow_forward_ios',
        },
        // 缩小图标
        zoomOutIcon: {
            type: String,
            default: 'zoom_out',
        },
        // 放大图标
        zoomInIcon: {
            type: String,
            default: 'zoom_in',
        },
        // 全屏图标
        fullscreenIcon: {
            type: String,
            default: 'fullscreen',
        },
        // 退出全屏图标
        exitFullscreenIcon: {
            type: String,
            default: 'fullscreen_exit',
        },
        // 水平反转图标
        flipHorizontalIcon: {
            type: String,
            default: 'swap_horiz',
        },
        // 垂直反转图标
        flipVerticalIcon: {
            type: String,
            default: 'swap_vert',
        },
        // 左旋转图标
        rotateLeftIcon: {
            type: String,
            default: 'rotate_left',
        },
        // 右旋转图标
        rotateRightIcon: {
            type: String,
            default: 'rotate_right',
        },
    },

    /**
     * 声明事件
     */
    emits: [
        'update:modelValue',
        'change',
        ...useDialogPluginComponent.emits
    ],

    /**
     * 组合式
     */
    setup(props, { emit }) {

        // ==========【数据】============================================================================================

        // 当前值
        const currentModelValue = ref(props.modelValue)

        // 目标节点
        const targetRef = ref()

        // 图片节点数组
        const imgRefs = ref([])

        // 加载中
        const loading = ref(true)

        // 当前激活索引
        const activeIndex = ref(props.startPosition)

        // 模式
        const isContain = ref(true)

        // 图片是否可点击
        const isClickImg = ref($n_get(configs, 'components.imgViewer.isClickImg') === true)

        // 转换效果
        const transform = ref({
            scale: 1,
            deg: 0,
            rotateX: 1,
            rotateY: 1,
            offsetX: 0,
            offsetY: 0,
            enableTransition: false,
        })

        // ==========【计算属性】==========================================================================================

        /**
         * 当前图片数组
         */
        const currentImages = computed(function () {

            const lists = []

            $n_forEach(props.images, function (url) {
                const origin = $n_getImage(url, { compress: false })
                if (origin) {
                    lists.push($n_getImage(url, { w: 1000 }))
                    // lists.push({
                    //     src: $n_getImage(url, { w: 1000 }),
                    //     origin,
                    // })
                }
            })

            return lists
        })

        /**
         * 是否单图
         */
        const isSingle = computed(function () {
            return currentImages.value.length <= 1
        })

        /**
         * 是否第一张
         */
        const isFirst = computed(function () {
            return activeIndex.value === 0
        })

        /**
         * 是否最后一张
         */
        const isLast = computed(function () {
            return activeIndex.value === currentImages.value.length - 1
        })

        /**
         * 当前图片
         */
        const currentImg = computed(function () {
            return currentImages.value[activeIndex.value]
        })

        /**
         * 图片样式
         */
        const imgStyle = computed(function () {
            const { scale, deg, rotateX, rotateY, offsetX, offsetY, enableTransition } = transform.value
            let translateX = offsetX / scale
            let translateY = offsetY / scale

            switch (deg % 360) {
                case 90:
                case -270:
                    ;[translateX, translateY] = [translateY, -translateX]
                    break
                case 180:
                case -180:
                    ;[translateX, translateY] = [-translateX, -translateY]
                    break
                case 270:
                case -90:
                    ;[translateX, translateY] = [-translateY, translateX]
                    break
            }

            const style = {
                    transform: `scale(${scale}) scale3d(${rotateX}, ${rotateY}, 1) rotate(${deg}deg) translate(${translateX}px, ${translateY}px)`,
                transition: enableTransition ? 'transform .3s' : '',
            }

            if (isContain.value) {
                style.maxWidth = style.maxHeight = '100%'
            }

            return style
        })

        // ==========【监听数据】=========================================================================================

        /**
         * 监听当前图片
         */
        watch(currentImg, function () {
            nextTick(function () {
                const $img = imgRefs.value[0]
                if (!$img?.complete) {
                    loading.value = true
                }
            })
        })

        /**
         * 监听当前索引
         */
        watch(activeIndex, function (val) {
            reset()
            emit('change', val)
        })

        /**
         * 监听值
         */
        watch(()=>props.modelValue, function (val) {
            currentModelValue.value = val
        })

        /**
         * 监听当前值
         */
        watch(currentModelValue, function (val) {
            emit('update:modelValue', val)
        })

        const {
            // 对话框节点
            dialogRef,
            // 对话框取消
            onDialogCancel,
            // 对话框隐藏
            onDialogHide,
        } = useDialogPluginComponent()

        // ==========【方法】=============================================================================================

        /**
         * 图片加载完成
         */
        function handleImgLoad() {
            loading.value = false
        }

        /**
         * 图片加载错误
         */
        function handleImgError() {
            loading.value = false
        }

        /**
         * 重置
         */
        function reset() {
            transform.value = {
                scale: 1,
                deg: 0,
                rotateX: 1,
                rotateY: 1,
                offsetX: 0,
                offsetY: 0,
                enableTransition: false,
            }
        }

        /**
         * 切换模式
         */
        function toggleMode() {
            if (loading.value) return

            // 切换是否包含
            isContain.value = ! isContain.value

            reset()
        }

        /**
         * 设置激活
         */
        function setActiveItem(index) {
            const len = currentImages.value.length
            activeIndex.value = (index + len) % len
        }

        /**
         * 前一张
         */
        function prev() {
            if (isFirst.value && !props.infinite) return
            setActiveItem(activeIndex.value - 1)
        }

        /**
         * 后一张
         */
        function next() {
            if (isLast.value && !props.infinite) return
            setActiveItem(activeIndex.value + 1)
        }

        /**
         * 操作
         */
        function handleActions(action, options = {}) {
            if (loading.value) return
            const { zoomRate, rotateDeg, enableTransition } = {
                zoomRate: props.zoomRate,
                rotateDeg: 90,
                enableTransition: true,
                ...options,
            }
            switch (action) {
                case 'zoomOut':
                    if (transform.value.scale > 0.2) {
                        transform.value.scale = Number.parseFloat(
                            (transform.value.scale / zoomRate).toFixed(3)
                        )
                    }
                    break
                case 'zoomIn':
                    if (transform.value.scale < 7) {
                        transform.value.scale = Number.parseFloat(
                            (transform.value.scale * zoomRate).toFixed(3)
                        )
                    }
                    break
                case 'clockwise':
                    transform.value.deg += rotateDeg
                    break
                case 'anticlockwise':
                    transform.value.deg -= rotateDeg
                    break
                case 'flipX':
                    transform.value.rotateX = -transform.value.rotateX
                    break
                case 'flipY':
                    transform.value.rotateY = -transform.value.rotateY
                    break
            }
            transform.value.enableTransition = enableTransition
        }

        /**
         * 点击遮蔽
         */
        function onMask() {
            if (! props.noBackdropDismiss) {
                onDialogCancel()
            }
        }

        /**
         * 点击图片
         */
        function onClickImg(e) {
            $n_run($n_get(configs, 'components.imgViewer.onClickImg'))(e)
        }

        // ==========【声明周期】=========================================================================================

        /**
         * 实例被挂载后调用
         */
        onMounted(function() {
            targetRef.value?.focus?.()
        })

        // ==========【返回】=============================================================================================

        return {
            currentModelValue,
            // 对话框节点
            dialogRef,
            // 对话框取消
            onDialogCancel,
            // 对话框隐藏
            onDialogHide,

            // 目标节点
            targetRef,
            // 图片节点数组
            imgRefs,
            // 加载中
            loading,
            // 当前激活索引
            activeIndex,
            // 是否包含
            isContain,
            // 转换效果
            transform,
            // 图片是否可点击
            isClickImg,

            // 当前图片数组
            currentImages,
            // 是否单图
            isSingle,
            // 是否第一张
            isFirst,
            // 是否最后一张
            isLast,
            // 当前图片
            currentImg,
            // 图片样式
            imgStyle,

            // 图片加载完成
            handleImgLoad,
            // 图片加载错误
            handleImgError,
            // 重置
            reset,
            // 切换模式
            toggleMode,
            // 设置激活
            setActiveItem,
            // 前一张
            prev,
            // 后一张
            next,
            // 操作
            handleActions,
            // 点击遮蔽
            onMask,
            // 点击图片
            onClickImg,
        }
    }
}
</script>

<style lang="scss">
.n-img-viewer {

    .q-dialog__inner > div {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    // 按钮
    &__btn {
        position: fixed !important;
        opacity: 0.8;
        color: #ffffff !important;
        background: #606266 !important;
        user-select: none;
        z-index: 1;

        // 关闭按钮
        &--close {
            top: 40px;
            right: 40px;
            width: 40px;
            height: 40px;
        }

        // 上一张按钮
        &--prev {
            top: 50%;
            left: 40px;
            width: 40px;
            height: 40px;
        }

        // 下一张按钮
        &--next {
            top: 50%;
            right: 40px;
            width: 40px;
            height: 40px;
        }
    }

    // 操作面板
    &__settings {
        left: 50%;
        bottom: 30px;
        transform: translateX(-50%);
        width: 282px;
        height: 44px;
        padding: 0 23px;
        border-radius: 22px;

        &__inner {
            width: 100%;
            height: 100%;
            text-align: justify;
            cursor: default;
            font-size: 23px;
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: space-around;
        }
    }
}
</style>
