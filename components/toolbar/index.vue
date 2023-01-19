<template>
    <container
        :header="header"
    >
        <q-toolbar>

            <!-- 左边按钮-->
            <q-btn
                :icon="leftIcon"
                dense
                round
                flat
                @click="layoutData.left.toggle"
                v-if="hiddenLeft ? ! layoutData.left.show() : (layoutData.left.data !== null)"
            />

            <!-- 左边插槽 -->
            <slot name="left" />

            <!-- 中间插槽 -->
            <q-toolbar-title>
                <q-scroll-area style="height:50px;" v-if="! inDialog">
                    <div class="n-toolbar__body">

                            <!-- 权限按钮 -->
                            <template v-for="item in currentRoleBtnLists">
                                <q-btn
                                    class="n-button-icon"
                                    :color="item.color"
                                    :outline="item.color === 'default'"
                                    :label="item.title"
                                    :icon="item.icon"
                                    v-if="! item.hidden"
                                    v-show="item.show"
                                    @click="onClick(item, tableSelected)"
                                    unelevated
                                />
                            </template>

                            <!-- 插槽 -->
                            <slot />

                        <!--</div>-->
                    </div>
                </q-scroll-area>
            </q-toolbar-title>

            <!-- 右边插槽 -->
            <slot name="right" />

            <!-- 表格筛选列按钮-->
            <q-btn
                icon="checklist"
                dense
                round
                flat
                v-if="tableColumns"
            >
                <q-menu
                    self="top middle"
                    :offset="[0, 8]"
                >
                    <q-list style="min-width: 250px" dense bordered>

                        <!-- 表格宫格 -->
                        <template v-if="tableGrid !== null">
                            <q-item
                                clickable
                                @click="onTableGrid"
                            >
                                <q-item-section>宫格模式</q-item-section>
                                <q-item-section side>
                                    <q-icon
                                        size="xs"
                                        name="check"
                                        v-show="tableGrid"
                                    />
                                </q-item-section>
                            </q-item>
                            <q-separator />
                        </template>

                        <!-- 筛选表格列 -->
                        <q-item
                            v-for="item in tableColumns"
                            clickable
                            @click="onTableVisible(item)"
                        >
                            <q-item-section>{{item.label}}</q-item-section>
                            <q-item-section side>
                                <q-icon
                                    size="xs"
                                    name="check"
                                    v-show="utils.indexOf(tableVisibleColumns, item.name) > -1"
                                />
                            </q-item-section>
                        </q-item>
                    </q-list>
                </q-menu>
            </q-btn>

            <!-- 右边按钮-->
            <q-btn
                :icon="rightIcon"
                dense
                round
                flat
                @click="layoutData.right.toggle"
                v-if="hiddenRight ? ! layoutData.right.show() : (layoutData.right.data !== null)"
            />
        </q-toolbar>
    </container>
</template>

<script>
import { inject, computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'

import Container from './container'
import { NLayoutKey } from '../../utils/symbols'

export default {

    /**
     * 标识
     */
    name: 'NToolbar',

    /**
     * 容器
     */
    components: {
        Container,
    },

    /**
     * 声明属性
     */
    props: {
        // 值(权限按钮列表)
        modelValue: Array,
        // 表格宫格
        tableGrid: {
            type: Boolean,
            default: null,
        },
        // 表格可见列
        tableVisibleColumns: Array,

        // 传参
        query: Object,
        // 表格列
        tableColumns: Array,
        // 表格选中数据
        tableSelected: Array,
        // 表格刷新
        tableRefresh: Function,
        // 表单节点
        formRef: Function,
        // 表单数据
        formData: Object,
        // 重置表单
        resetForm: Function,
        // 请求前执行
        requestBefore: Function,
        // 请求成功执行
        requestSuccess: Function,
        // 请求失败执行
        requestFail: Function,
        // 请求后执行
        requestAfter: Function,
        // 左边图标
        leftIcon: {
            type: String,
            default: 'format_list_bulleted',
        },
        // 默认隐藏左边(宽屏不显示, 小屏自动显示)
        hiddenLeft: Boolean,
        // 左边图标
        rightIcon: {
            type: String,
            default: 'search',
        },
        // 是否请求权限按钮数据
        getRoleBtn: {
            type: Boolean,
            default: true,
        },
        // 是否隐藏右边(宽屏不显示, 小屏自动显示)
        hiddenRight: Boolean,
        // 是否头部
        header: Boolean,
    },

    /**
     * 声明事件
     */
    emits: [
        'update:modelValue',
        'update:tableVisibleColumns',
    ],

    /**
     * 组合式
     */
    setup(props, { emit }) {

        // ==========【注入】============================================================================================

        // 获取布局注入数据
        const $nLayout = inject(NLayoutKey)

        // 是否在对话框中
        const inDialog = ref(!! utils.$dialog.inject())

        // ==========【数据】============================================================================================

        // quasar 对象
        const $q = useQuasar()

        // 当前路由地址
        const $route = useRoute()

        // ==========【计算属性】=========================================================================================

        /**
         * 当前权限按钮
         */
        const currentRoleBtnLists = computed(function() {

            if (utils.isFillArray(props.modelValue)) {

                const lists = _.filter(utils.$role.formatRoleBtnLists(props.modelValue), e => e.type > 2)

                // 格式化权限按钮列表
                utils.forEach(lists, function(item) {

                    if (! item.hidden) {

                        // 如果是单条数据显示
                        const isSingle = item.show === 'single'

                        // 如果是单条 || 多条显示
                        if (isSingle || item.show === 'multi') {

                            // 初始为不显示
                            item.show = false

                            // 如果有数据
                            if (utils.isFillArray(props.tableSelected)) {

                                // 如果是单个显示
                                if (isSingle) {
                                    item.show = props.tableSelected.length === 1

                                    // 否则是多个显示
                                } else {
                                    item.show = props.tableSelected.length >= 1
                                }
                            }
                        }

                        // 如果是手机模式
                        if ($q.platform.is.mobile) {
                            item.icon = undefined
                        }
                    }
                })

                return lists
            }

            return []
        })

        /**
         * 权限传参
         */
        const roleQuery = computed(function () {

            const query = {}

            // 合并路由传参
            if (utils.isFillObject($route.query)) {
                Object.assign(query, $route.query)
            }

            // 合并声明传参
            if (utils.isFillObject(props.query)) {
                Object.assign(query, props.query)
            }

            return utils.numberDeep(query)
        })

        // ==========【方法】=============================================================================================

        /**
         * 按钮点击
         */
        async function onClick({ data }, tableSelected) {

            // 角色请求
            await utils.$role.request({
                // 按钮数据
                data,
                // 传参
                query: roleQuery.value,
                // 表格选中数据
                tableSelected,
                // 表格刷新
                tableRefresh: props.tableRefresh,
                // 检查是否正在上传文件
                checkUploading: $nLayout.checkUploading,
                // 表单节点
                formRef: props.formRef,
                // 表单数据
                formData: props.formData,
                // 重置表单
                resetForm: props.resetForm,
                // 请求前执行
                requestBefore: props.requestBefore,
                // 请求数据执行
                requestData: props.requestData,
                // 请求成功执行
                requestSuccess: props.requestSuccess,
                // 请求后执行
                requestAfter: props.requestAfter,
            })
        }

        // 更新布局数据
        $nLayout.update(function(data) {
            Object.assign(data.role, {
                click: onClick,
            })
        })


        /**
         * 表格宫格点击
         */
        function onTableGrid() {
            emit('update:tableGrid', ! props.tableGrid)
        }

        /**
         * 表格可见列点击
         */
        function onTableVisible(item) {

            const columns = [...props.tableVisibleColumns]

            const index = utils.indexOf(props.tableVisibleColumns, item.name)
            if (index > -1) {
                columns.splice(index, 1)
            } else {
                columns.push(item.name)
            }

            emit('update:tableVisibleColumns', columns)
        }

        // ==========【返回】=============================================================================================

        return {
            // 是否在对话框中
            inDialog,
            // 布局数据
            layoutData: $nLayout.data,
            // 当前权限按钮
            currentRoleBtnLists,

            // 按钮点击
            onClick,
            // 表格宫格点击
            onTableGrid,
            // 表格可见列点击
            onTableVisible,
        }
    },
}
</script>

<style lang="scss">
@import "@/assets/sass/var.scss";

.n-toolbar {
    &__body {
        //height: 50px;
        //display: flex;
        //align-items: center;

        .q-btn {
            margin-top: 7px;

            // 非第一个子节点
            &:not(:first-child) {
                margin-left: 7px;
            }
        }
    }
}
</style>
