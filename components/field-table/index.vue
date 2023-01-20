<template>
    <q-field
        :class="fieldFocused ? 'q-field--float q-field--focused q-field--highlighted' : ''"
        :model-value="modelValue"
        :readonly="readonly"
        @clear="onClear"
        v-bind="$attrs"
    >
        <template v-slot:control>

            <!--&lt;!&ndash; 显示值 &ndash;&gt;-->
            <!--<div v-if="showValue">{{showValue}}</div>-->

            <!--&lt;!&ndash; 显示占位符 &ndash;&gt;-->
            <!--<div class="n-placeholder" v-else-if="placeholder">{{placeholder}}</div>-->
        </template>

        <template v-slot:append>
            <q-icon
                class="cursor-pointer"
                name="search"
                @click.prevent.stop="onDialog"
            />
        </template>

        <q-popup-proxy
            ref="popupRef"
            @before-show="onPopupBeforeShow"
            @show="onPopupShow"
            @before-hide="onPopupBeforeHide"
            @hide="onPopupHide"
            v-if="! readonly"
        >
            <q-table
                ref="tableRef"
                class="n-table"
                style="min-width:500px;max-width:90vw;height: 300px;"
                v-model:pagination="tablePagination"
                v-model:selected="tableSelected"
                :row-key="tableRowKey"
                :rows="tableRows"
                :columns="tableColumns"
                :selection="tableSelection"
                :loading="tableLoading"
                :rows-per-page-options="tableRowsPerPageOptions"
                @row-click="tableRowClick"
                @row-dblclick="tableRowDblclick"
                @request="tableRequest"
                flat
                virtual-scroll
                dense
            >
                <!-- 图片 -->
                <template
                    v-for="imgName in tableImgNames"
                    v-slot:[`body-cell-${imgName}`]="props"
                >
                    <q-td :props="props">
                        <!-- 缩略图 -->
                        <n-thumbnail
                            :src="props.row[imgName]"
                            preview
                        />
                    </q-td>
                </template>

                <!-- 插槽 -->
                <template
                    v-for="slotName in slotNames"
                    v-slot:[slotName]="props"
                >
                    <q-td :props="props">
                        <slot
                            :name="slotName"
                            v-bind="props"
                        />
                    </q-td>
                </template>

                <!-- 合计 -->
                <!--<template v-slot:bottom-row="props" v-if="tableSummary">-->
                <!--    <n-table-summary-->
                <!--        :props="props"-->
                <!--        :data="tableSummary"-->
                <!--        :selection="tableSelection"-->
                <!--    />-->
                <!--</template>-->

                <!-- 翻页 -->
                <template v-slot:pagination="props">
                    <n-table-pagination
                        :props="props"
                        :table-refresh="tableRefresh"
                    />
                </template>
            </q-table>
        </q-popup-proxy>
    </q-field>

    <q-dialog v-model="showDialog">
        <q-card>
            <q-table
                ref="tableRef"
                class="n-table"
                style="min-width:500px;max-width:90vw;height: 300px;"
                v-model:pagination="tablePagination"
                v-model:selected="tableSelected"
                :row-key="tableRowKey"
                :rows="tableRows"
                :columns="tableColumns"
                :selection="tableSelection"
                :loading="tableLoading"
                :rows-per-page-options="tableRowsPerPageOptions"
                @row-click="tableRowClick"
                @row-dblclick="tableRowDblclick"
                @request="tableRequest"
                flat
                virtual-scroll
                dense
            >
                <!-- 图片 -->
                <template
                    v-for="imgName in tableImgNames"
                    v-slot:[`body-cell-${imgName}`]="props"
                >
                    <q-td :props="props">
                        <!-- 缩略图 -->
                        <n-thumbnail
                            :src="props.row[imgName]"
                            preview
                        />
                    </q-td>
                </template>

                <!-- 插槽 -->
                <template
                    v-for="slotName in slotNames"
                    v-slot:[slotName]="props"
                >
                    <q-td :props="props">
                        <slot
                            :name="slotName"
                            v-bind="props"
                        />
                    </q-td>
                </template>

                <!-- 合计 -->
                <!--<template v-slot:bottom-row="props" v-if="tableSummary">-->
                <!--    <n-table-summary-->
                <!--        :props="props"-->
                <!--        :data="tableSummary"-->
                <!--        :selection="tableSelection"-->
                <!--    />-->
                <!--</template>-->

                <!-- 翻页 -->
                <template v-slot:pagination="props">
                    <n-table-pagination
                        :props="props"
                        :table-refresh="tableRefresh"
                    />
                </template>
            </q-table>
            <!--<q-card-section>-->
            <!--    <div class="text-h6">Alert</div>-->
            <!--</q-card-section>-->

            <!--<q-card-section class="q-pt-none">-->
            <!--    Lorem ipsum dolor sit amet consectetur adipisicing elit. Rerum repellendus sit voluptate voluptas eveniet porro. Rerum blanditiis perferendis totam, ea at omnis vel numquam exercitationem aut, natus minima, porro labore.-->
            <!--</q-card-section>-->

            <!--<q-card-actions align="right">-->
            <!--    <q-btn flat label="OK" color="primary" v-close-popup />-->
            <!--</q-card-actions>-->
        </q-card>
    </q-dialog>
</template>

<script>
import { ref, reactive, computed, watch, nextTick, onMounted } from 'vue'
import { date as quasarDate } from 'quasar'
import NDialog from "../dialog";

export default {

    /**
     * 标识
     */
    name: 'NFieldTable',
    components: {NDialog},
    /**
     * 声明属性
     */
    props: {
        // 值
        modelValue: [String, Number],
        // 占位符
        placeholder: String,
        // 是否只读
        readonly: Boolean,

        // 表格请求地址
        url: String,
        // 路由组件路径
        route: String,
        // 值属性名称
        valueKey: {
            type: String,
            required: true,
        },
        // 快捷表格显示的属性名称数组
        showKeys: {
            type: Array,
            required: true,
        },
        // 默认搜索属性名称
        searchKey: String,

        // 表格列数据
        columns: Array,
        // 表格行唯一键值
        rowKey: {
            type: String,
            default: 'id',
        },
        // 是否多选
        multiple: Boolean,
        // 行数据
        rows: Array,
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
    setup(props, { emit, slots }) {


        // ==========【数据】============================================================================================

        // 字段组件获取焦点
        const fieldFocused = ref(false)

        // 弹出层节点
        const popupRef = ref(null)

        // 是否显示对话框
        const showDialog = ref(false)

        // 表格是否已加载
        let tableLoaded = false

        // 创建表格
        const $table = utils.$table.create({
            url: props.route ? props.route : props.url,
            // 获取表格列数据
            columns: getTableColumns(),
            // 表格行唯一键值
            rowKey: props.rowKey,
            // 选择类型, 可选值 single multiple none
            selection: props.multiple ? 'multiple' : 'none',
            // 关闭宫格
            showGrid: false,
            // 关闭可见列
            showVisibleColumns: false,
        })

        // ==========【计算属性】=========================================================================================

        /**
         * 插槽标识
         */
        const slotNames = computed(function() {
            if (utils.isValidObject(slots)) {
                return Object.keys(slots)
            }
            return []
        })

        // ==========【监听数据】=========================================================================================

        /**
         * 获取快捷表格列数据
         */
        // watch([()=>props.modelValue, ()=>props.end, ()=>props.type], function() {
        //
        // })

        // ==========【方法】=============================================================================================

        /**
         * 获取表格列数据
         */
        function getTableColumns() {

            const columns = []

            // 获取原始表格列数据
            let rawTableColumns = props.route
                // 如果有路由组件路径
                ? utils.$table.config(props.route, 'columns')
                // 否则为自定义表格列数据
                : props.columns

            // 如果有原始表格列数据
            if (utils.isValidArray(rawTableColumns)) {

                // 克隆原始表格列数据
                rawTableColumns = _.cloneDeep(rawTableColumns)

                // 快捷表格显示的属性名称数组
                utils.forEach(props.showKeys, function (key) {
                    for (const item of rawTableColumns) {
                        if (item.name === key) {
                            // 删除搜索字段
                            if (_.has(item, 'search')) {
                                delete item.search
                            }
                            // 删除可见字段
                            if (_.has(item, 'visible')) {
                                delete item.visible
                            }
                            columns.push(item)
                        }
                    }
                })
            }

            return columns
        }

        /**
         * 取消
         */
        function onCancel() {
            // 还原原始值
            // onEmit('update:modelValue', oldModelValue)
        }

        /**
         * 弹出层显示前回调
         */
        function onPopupBeforeShow() {

            // 字段组件获取焦点
            fieldFocused.value = true
        }

        /**
         * 弹出层显示回调
         */
        function onPopupShow() {

            // 表格重新加载
            if (! tableLoaded) {
                $table.tableReload()
                tableLoaded = true
            }
        }

        /**
         * 弹出层隐藏前回调
         */
        function onPopupBeforeHide() {

            // 字段组件失去焦点
            fieldFocused.value = false
        }

        /**
         * 弹出层隐藏后回调
         */
        function onPopupHide() {

        }

        /**
         * 清空
         */
        function onClear() {
            emit('update:modelValue', null)
            popupRef.value.hide()
        }

        /**
         * 显示对话框
         */
        function onDialog() {

            showDialog.value = true
            console.log('ssss')
        }

        // ==========【生命周期】=========================================================================================


        // ==========【返回】=============================================================================================

        return {
            // 解构表格实例
            ...$table,

            // 字段组件获取焦点
            fieldFocused,
            // 弹出层节点
            popupRef,
            // 是否显示对话框
            showDialog,

            // 插槽 body 单元格标识
            slotNames,

            // 取消
            onCancel,
            // 弹出层显示前回调
            onPopupBeforeShow,
            // 弹出层显示回调
            onPopupShow,
            // 弹出层隐藏前回调
            onPopupBeforeHide,
            // 弹出层隐藏后回调
            onPopupHide,
            // 清空
            onClear,

            // 显示对话框
            onDialog,
        }
    },
}
</script>

<style lang="scss" scoped>
@import "@/assets/sass/var.scss";

.date {

    // 选择容器
    &__select {
        background-color: #ffffff;
    }

    // 时间容器
    &__time {
        + .date__settings {
            // 等同 q-pt-sm
            padding-top: map-get($space-sm, 'y');
        }
    }
}

/**
 * 暗色
 */
.body--dark {
    .date__select {
        background-color: $color-gray-86;
    }
}
</style>
