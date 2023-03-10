<template>
    <div class="n-uploader-query">

        <!-- 上传按钮 -->
        <slot
            name="button"
            :disable="disable || readonly"
            :size="currentSize"
            v-if="$slots.button"
        />
        <div
            class="n-uploader-query__button--button"
            v-else-if="! noButton && currentButtonType === 'button'"
        >
            <q-btn
                class="n-button-icon"
                :label="buttonText || '上传'"
                @click="uploader.chooseUpload"
                color="primary"
                outline
                :disable="disable || readonly"
                unelevated
                v-bind="buttonProps"
            />
        </div>

        <!-- 拖拽器 -->
        <n-dragger
            class="n-uploader-query__query row q-gutter-sm"
            v-model="query"
            :drag="currentDrag"
            @update:model-value="uploader.updateValue"
            v-slot="{ mousedown, fromIndex, dragStart, dragEnter, dragEnd }"
        >
            <!-- 上传图片队列 -->
            <template v-if="type === 'image'">

                <!-- 左边方块按钮 -->
                <template v-if="! disable && ! readonly && ! rightSquareButton">
                    <slot
                        name="square-button"
                        :size="currentSize"
                        :show="showSquareButton"
                        v-if="$slots['square-button']"
                    />
                    <div
                        class="n-uploader-query__button--square cursor-pointer"
                        :style="{
                            width: toPx(currentSize),
                            height: toPx(currentSize),
                        }"
                        @click="uploader.chooseUpload"
                        v-show="showSquareButton"
                        v-else-if="! noButton && currentButtonType === 'square'"
                    >
                        <q-icon
                            name="add"
                            :size="toPx(currentSize / 2)"
                        />
                        <div class="n-uploader-query__button--square__text" v-if="buttonText">{{buttonText}}</div>
                    </div>
                </template>

                <!-- 单个图片 -->
                <div
                    v-for="(fileItem, fileItemIndex) in query"
                    :key="`query-item-${fileItem.id}`"
                    class="n-uploader-query__item n-uploader-query__item--image"
                    :class="{
                        ghost: fileItemIndex === fromIndex,
                    }"
                    :draggable="currentDrag"
                    @mousedown.self="mousedown($event, fileItemIndex)"
                    @mouseup="dragEnd"
                    @dragstart="dragStart($event, fileItemIndex)"
                    @dragenter="dragEnter($event, fileItemIndex)"
                    @dragend="dragEnd"
                >
                    <n-img
                        :src="getImage(fileItem)"
                        :spinner-size="toPx(currentSize / 2)"
                        :width="toPx(currentSize)"
                        :height="toPx(currentSize)"
                        fit="fill"
                    >
                        <!-- 内容 -->
                        <div
                            class="n-uploader-query__item__inner absolute-full flex flex-center no-padding transparent"
                            :class="{
                                'transparent': fileItem.status < UPLOAD_STATUS.success,
                            }"
                            v-if="fileItem.status !== UPLOAD_STATUS.success"
                        >
                            <!-- 如果上传失败 -->
                            <div
                                class="n-uploader-query__item__inner__msg n-uploader-query__item__inner__msg--error"
                                v-if="fileItem.status === UPLOAD_STATUS.fail"
                            >{{fileItem.msg}}</div>

                            <!-- 上传中前 -->
                            <q-circular-progress
                                indeterminate
                                rounded
                                :size="toPx(currentSize / 1.5)"
                                :thickness="0.14"
                                color="white"
                                v-if="fileItem.status < UPLOAD_STATUS.uploading"
                            />

                            <!-- 上传中 -->
                            <q-circular-progress
                                :value="fileItem.progress"
                                :size="toPx(currentSize / 1.5)"
                                :thickness="0.14"
                                color="white"
                                track-color="grey-5"
                                show-value
                                v-else-if="fileItem.status === UPLOAD_STATUS.uploading"
                            >
                                <q-icon
                                    class="cursor-pointer"
                                    name="pause"
                                    :size="toPx(currentSize / 3)"
                                    @click="uploader.deleteFileItem(fileItem)"
                                />
                            </q-circular-progress>
                        </div>

                        <!-- 操作 -->
                        <div
                            class="n-uploader-query__item__settings transparent no-padding"
                            v-if="fileItem.status !== UPLOAD_STATUS.uploading"
                        >
                            <!-- 预览 -->
                            <q-icon
                                class="n-uploader-query__item__settings__icon cursor-pointer"
                                name="search"
                                size="xs"
                                title="预览"
                                @click="uploader.previewImage(fileItem)"
                                v-if="! noPreview && getImage(fileItem)"
                            />

                            <!-- 删除 -->
                            <q-icon
                                class="n-uploader-query__item__settings__icon cursor-pointer"
                                name="close"
                                size="xs"
                                title="删除"
                                @click="uploader.deleteFileItem(fileItem)"
                                v-if="! noDelete && ! disable && ! readonly"
                            />
                        </div>
                    </n-img>
                </div>

                <!-- 右边方块按钮 -->
                <template v-if="! disable && ! readonly && rightSquareButton">
                    <slot
                        name="square-button"
                        :size="currentSize"
                        :show="showSquareButton"
                        v-if="$slots['square-button']"
                    />
                    <div
                        class="n-uploader-query__button--square cursor-pointer"
                        :style="{
                            width: toPx(currentSize),
                            height: toPx(currentSize),
                        }"
                        @click="uploader.chooseUpload"
                        v-show="showSquareButton"
                        v-else-if="! noButton && currentButtonType === 'square'"
                    >
                        <q-icon
                            name="add"
                            :size="toPx(currentSize / 2)"
                        />
                        <div class="n-uploader-query__button--square__text" v-if="buttonText">{{buttonText}}</div>
                    </div>
                </template>
            </template>

            <!-- 上传文件队列 -->
            <template v-else>

                <!-- 单个文件 -->
                <div
                    v-for="(fileItem, fileItemIndex) in query"
                    :key="`query-item-${fileItem.id}`"
                    class="n-uploader-query__item n-uploader-query__item--file"
                    :class="{
                        ghost: fileItemIndex === fromIndex,
                    }"
                    :style="{
                        height: toPx(currentSize),
                    }"
                    :draggable="currentDrag"
                    @mousedown.self="mousedown($event, fileItemIndex)"
                    @mouseup="dragEnd"
                    @dragstart="dragStart($event, fileItemIndex)"
                    @dragenter="dragEnter($event, fileItemIndex)"
                    @dragend="dragEnd"
                >
                    <!-- 图标 -->
                    <div
                        class="n-uploader-query__item__icon"
                        :style="{
                            width: toPx(currentSize),
                            height: toPx(currentSize),
                        }"
                    >
                        <!-- 上传中前 -->
                        <q-circular-progress
                            class="n-uploader-query__item__icon__icon"
                            indeterminate
                            rounded
                            :size="toPx(currentSize / 1.8)"
                            :thickness="0.18"
                            v-if="fileItem.status < UPLOAD_STATUS.uploading"
                        />

                        <!-- 上传中 -->
                        <q-circular-progress
                            class="n-uploader-query__item__icon__icon"
                            :value="fileItem.progress"
                            :size="toPx(currentSize / 1.8)"
                            :thickness="0.18"
                            show-value
                            v-else-if="fileItem.status === UPLOAD_STATUS.uploading"
                        >
                            <q-icon
                                class="cursor-pointer"
                                name="pause"
                                :size="toPx(currentSize / 3)"
                                @click="uploader.deleteFileItem(fileItem)"
                            />
                        </q-circular-progress>

                        <!-- 文件图标 -->
                        <q-icon
                            class="n-uploader-query__item__icon__icon"
                            name="description"
                            :size="toPx(currentSize / 1.5)"
                            v-else-if="type === 'file'"
                        />

                        <!-- 播放图标 -->
                        <q-icon
                            class="n-uploader-query__item__icon__icon cursor-pointer"
                            name="play_circle"
                            title="播放"
                            :size="toPx(currentSize / 1.5)"
                            @click="uploader.play(fileItem)"
                            v-else
                        />
                    </div>

                    <!-- 信息 -->
                    <div class="n-uploader-query__item__info">
                        <!-- 标题 -->
                        <div class="n-uploader-query__item__info__title ellipsis">{{getFileName(fileItem)}}</div>
                        <!-- 错误提示 -->
                        <div class="n-uploader-query__item__info__msg--error" v-if="fileItem.status === UPLOAD_STATUS.fail">{{fileItem.msg}}</div>
                    </div>

                    <!-- 操作 -->
                    <div class="n-uploader-query__item__settings">

                        <template v-if="fileItem.status === UPLOAD_STATUS.success">

                            <!-- 复制地址 -->
                            <q-icon
                                class="n-uploader-query__item__settings__icon cursor-pointer"
                                name="content_copy"
                                color="white"
                                size="xs"
                                title="复制地址"
                                @click="uploader.copyUrl(fileItem)"
                            />

                            <!-- 修改 -->
                            <q-icon
                                class="n-uploader-query__item__settings__icon cursor-pointer"
                                name="edit"
                                color="white"
                                size="xs"
                                title="修改"
                                @click="uploader.previewImage(fileItem)"
                                v-if="! noEdit && ! disable && ! readonly"
                            >
                                <q-popup-edit
                                    :model-value="fileItem.title"
                                    buttons
                                    label-set="保存"
                                    @save="uploader.editFileTitle($event, fileItem)"
                                    v-slot="scope"
                                >
                                    <q-input
                                        v-model="scope.value"
                                        dense
                                        autofocus
                                        counter
                                        :maxlength="50"
                                        @keyup.enter="scope.set"
                                    >
                                        <template v-slot:append>
                                            <span class="text-subtitle2 text-weight-bold">.{{fileItem.ext}}</span>
                                        </template>
                                    </q-input>
                                </q-popup-edit>
                            </q-icon>
                        </template>

                        <!-- 删除 -->
                        <q-icon
                            class="n-uploader-query__item__settings__icon cursor-pointer"
                            name="close"
                            color="white"
                            size="xs"
                            title="删除"
                            @click="uploader.deleteFileItem(fileItem)"
                            v-if="! noDelete && ! disable && ! readonly"
                        />
                    </div>
                </div>
            </template>
        </n-dragger>
    </div>
</template>

<script>
import { onMounted, computed, inject } from 'vue'
import { useQuasar } from 'quasar'

import $n_has from 'lodash/has'
import $n_get from 'lodash/get'

import $n_px from '@netang/utils/px'
import $n_isValidArray from '@netang/utils/isValidArray'
import $n_isValidString from '@netang/utils/isValidString'

import $n_getImage from '../../utils/getImage'

import NDragger from '../dragger'

import { NUploaderKey } from '../../utils/symbols'

import {
    // 上传状态
    UPLOAD_STATUS,
} from '../../utils/useUploader'

export default {

    /**
     * 标识
     */
    name: 'NUploaderQuery',

    /**
     * 组件
     */
    components: {
        NDragger,
    },

    /**
     * 声明属性
     */
    props: {
        // 按钮类型, 可选值 square button
        buttonType: {
            type: String,
            validator: v => [ 'square', 'button' ].includes(v),
        },
        // 按钮文字
        buttonText: String,
        // 按钮声明属性
        buttonProps: Object,
        // 图片/按钮/文件 尺寸
        size: Number,
        // 是否开启拖拽
        drag: {
            type: Boolean,
            default: true,
        },
        // 是否禁用
        disable: Boolean,
        // 是否只读
        readonly: Boolean,
        // 是否隐藏按钮
        noButton: Boolean,
        // 是否隐藏预览按钮
        noPreview: Boolean,
        // 是否隐藏修改按钮
        noEdit: Boolean,
        // 是否隐藏删除按钮
        noDelete: Boolean,
        // 自动显示方块按钮
        autoShowSquareButton: Boolean,
        // 方块按钮在右边显示
        rightSquareButton: Boolean,
    },

    /**
     * 声明事件
     */
    emits: [
        'update:modelValue',
    ],

    /**
     * 组合式
     */
    setup(props) {

        // ==========【数据】============================================================================================

        // quasar 对象
        const $q = useQuasar()

        // 获取上传器注入数据
        const {
            // 声明属性
            props: uploaderProps,
            // 上传器
            uploader,
            // 文件队列
            query,
        } = inject(NUploaderKey)

        // ==========【计算属性】=========================================================================================

        /**
         * 当前是否开启拖拽
         */
        const currentDrag = computed(function() {
            return props.drag
                && $n_isValidArray(query.value)
                && query.value.length > 1
                && ! props.readonly
                && ! props.disable
        })

        /**
         * 当前按钮类型
         */
        const currentButtonType = computed(function () {
            if (props.buttonType) {
                return props.buttonType
            }
            return uploaderProps.type === 'image' ? 'square' : 'button'
        })

        /**
         * 当前尺寸
         */
        const currentSize = computed(function () {
            if (props.size) {
                return props.size
            }
            return uploaderProps.type === 'image' ? 70 : 50
        })

        /**
         * 是否显示方块按钮
         */
        const showSquareButton = computed(function () {
            // 自动显示方块按钮 && 有上传文件限制数量
            return props.autoShowSquareButton && uploaderProps.count > 0 ?
                // 如果 上传文件列表数量 < 上传文件限制数量
                 query.value.length < uploaderProps.count
                // 始终显示
                : true
        })

        // ==========【方法】=============================================================================================

        /**
         * 获取图片地址
         */
        function getImage(fileItem) {
            return $n_has(fileItem, '__img') ?
                fileItem.__img
                : (
                    $n_isValidString(fileItem.hash) ?
                        $n_getImage(fileItem.hash, { w: $q.platform.is.mobile ? currentSize.value * 2 : currentSize.value })
                        : ''
                )
        }

        /**
         * 获取文件名称
         */
        function getFileName(fileItem) {
            return fileItem.title + ($n_get(fileItem, 'ext') ? '.' + fileItem.ext : '')
        }

        // ==========【生命周期】=========================================================================================

        /**
         * 实例被挂载后调用
         */
        onMounted( async function() {

        })

        // ==========【返回】=============================================================================================

        return {
            // 上传状态
            UPLOAD_STATUS,
            // 上传文件类型, 可选值 file image video audio
            type: uploaderProps.type,
            // 上传文件数量(0:不限)
            count: uploaderProps.count,
            // 上传文件队列
            query,

            // 当前是否开启拖拽
            currentDrag,
            // 当前按钮类型
            currentButtonType,
            // 当前尺寸
            currentSize,
            // 是否显示方块按钮
            showSquareButton,

            // 上传器
            uploader,

            // 获取图片地址
            getImage,
            // 获取文件名称
            getFileName,

            toPx: $n_px,
        }
    },
}
</script>

<style lang="scss">
@import "@/assets/sass/variables.scss";

// 上传器队列
.n-uploader-query {

    // 上传按钮
    &__button {

        // 方块
        &--square {
            display: inline-flex;
            vertical-align: middle;
            overflow: hidden;
            border: 1px dashed rgba(var(--n-reverse-color-rgb), 0.2);
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: rgba(var(--n-reverse-color-rgb), 0.4);
            border-radius: 4px;

            &:hover {
                border-color: $primary;
            }

            // 文字
            &__text {
                font-size: 12px;
            }
        }

        // 按钮
        &--button {
            + .n-uploader-query__query {
                margin-top: 0;
            }
        }
    }

    // 上传单个文件
    &__item {
        position: relative;

        // 开启拖拽
        &[draggable="true"] {
            cursor: move;
        }

        // 当前拖拽占位元素
        &.ghost {
            &:after {
                content: "";
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                border: 2px dashed mix(#ffffff, $primary, 40%);
                border-radius: 4px;
                background-color: rgba(255, 255, 255, 0.75);
            }

            .n-uploader-query__item__inner,
            .n-uploader-query__item__settings {
                display: none;
            }
        }

        &:hover {
            .n-uploader-query__item__settings {
                visibility: visible;
            }
        }

        // 单个图片
        &--image {
            border-radius: 4px;
            background-color: rgba(0,0,0,0.1);
            overflow: hidden;
        }

        // 单个文件
        &--file {
            position: relative;
            width: 300px;
            display: flex;
            flex-direction: row;
            align-items: center;
            border-radius: 4px;
            color: rgba(var(--n-reverse-color-rgb), 0.8);
            background-color: rgba(var(--n-reverse-color-rgb), 0.05);

            // 图标
            .n-uploader-query__item__icon {
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1;

                &__icon {
                    color: rgba(var(--n-reverse-color-rgb), 0.2);
                }
            }

            // 信息
            .n-uploader-query__item__info {
                display: flex;
                flex-direction: column;
                line-height: 18px;

                &__title {
                    max-width: 150px;
                }

                &__msg--error {
                    color: $negative;
                }
            }
        }

        //操作
        &__settings {
            position: absolute;
            top: 5px;
            right: 5px;
            visibility: hidden;

            &__icon {
                background-color: rgba(0,0,0,0.5);
                border-radius: 50%;
                padding: 5px;

                + .n-uploader-query__item__settings__icon {
                    margin-left: 4px;
                }

                &:hover {
                    background-color: rgba(0,0,0,0.8);
                }
            }
        }

        // 内容
        &__inner {

            &__msg {
                margin: 3px;
                padding: 2px 3px;
                line-height: 18px;
                font-size: 12px;
                background-color: rgba(0,0,0,0.6);
                border-radius: 6px;

                &--error {
                    background-color: $warning;
                }
            }
        }
    }
}

@media (max-width: $breakpoint-xs-max){
    // 上传器队列
    .n-uploader-query {
        // 上传单个文件
        &__item {
            // 单个文件
            &--file {
                width: 100%;
            }
        }

        // 信息
        .n-uploader-query__item__info {
            &__title {
                max-width: 200px;
            }
        }
    }
}

/**
 * 手机版
 */
body.mobile {
    // 上传器队列
    .n-uploader-query {
        // 上传单个文件
        &__item {
            &__settings {
                visibility: visible;
            }
        }
    }
}

/**
 * 暗黑
 */
.body--dark {
    .n-uploader-query__item--file {
        .n-uploader-query__item__settings {
            // 图标
            &__icon {
                background-color: rgba(255,255,255, 0.1);

                &:hover {
                    background-color: rgba(255,255,255, 0.2);
                }
            }
        }
    }
}
</style>
