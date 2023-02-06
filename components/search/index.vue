<template>
    <div class="flex column absolute-full" v-if="$n_isValidArray(options)">
        <q-scroll-area class="n-flex-1">

            <div class="n-search q-pa-sm q-pt-sm q-gutter-sm">

                <template
                    v-for="(item, itemIndex) in options"
                >
                    <template v-if="! item.hide">
                        <!-- 如果有 name 插槽 -->
                        <slot
                            :name="`name-${item.name}`"
                            :item="item"
                            :item-index="itemIndex"
                            v-if="$slots[`name-${item.name}`]"
                        />

                        <!-- 否则自定义组件 -->
                        <n-search-item
                            :data="item"
                            v-model="modelValue[itemIndex]"
                            v-slot="{ label, index, multiple }"
                            v-else
                        >
                            <!-- 日期 -->
                            <template v-if="item.type === 'date'">

                                <!-- 日期 -->
                                <n-field-date
                                    class="n-field-fieldset n-flex-1"
                                    :label="label"
                                    v-model="modelValue[itemIndex][index].value"
                                    :type="modelValue[itemIndex][0].dateType"
                                    dense
                                    :end-date="index === 1"
                                    outlined
                                    clearable
                                />

                                <!-- 日期类型 -->
                                <q-select
                                    v-model="modelValue[itemIndex][0].dateType"
                                    :options="[
                                        { label: '年', value: 'year' },
                                        { label: '月', value: 'month' },
                                        { label: '日', value: 'day' },
                                        { label: '时', value: 'datetime' },
                                    ]"
                                    map-options
                                    emit-value
                                    outlined
                                    dense
                                    options-dense
                                    v-if="index === 0"
                                />
                            </template>

                            <!-- 数字输入框 价格 -->
                            <n-input-number
                                class="n-field-fieldset"
                                :label="label"
                                v-model="modelValue[itemIndex][index].value"
                                dense
                                outlined
                                clearable

                                :decimal-length="2"
                                :cent-to-yuan="centToYuan"

                                v-bind="item.input"
                                v-else-if="item.type === 'price'"
                            />

                            <!-- 输入框 -->
                            <template v-else-if="item.searchType === 'input'">
                                <q-input
                                    class="n-field-fieldset"
                                    :label="label"
                                    v-model="modelValue[itemIndex][index].value"
                                    dense
                                    outlined
                                    clearable
                                    v-bind="item.input"
                                />
                            </template>

                            <!-- 下拉列表 -->
                            <q-select
                                class="n-field-fieldset"
                                :label="label"
                                v-model="modelValue[itemIndex][index].value"
                                map-options
                                emit-value
                                outlined
                                dense
                                :multiple="multiple"
                                :use-chips="multiple"
                                options-dense
                                clearable
                                v-bind="item.select"
                                v-else-if="item.searchType === 'select'"
                            />

                            <!-- 下拉树 -->
                            <n-field-tree
                                class="n-field-fieldset"
                                :label="label"
                                v-model="modelValue[itemIndex][index].value"
                                dense
                                outlined
                                :multiple="multiple"
                                v-bind="item.tree"
                                v-else-if="item.searchType === 'tree'"
                            />

                            <!-- 下拉表格 -->
                            <n-field-table
                                class="n-field-fieldset"
                                :label="label"
                                v-model="modelValue[itemIndex][index].value"
                                dense
                                outlined
                                :multiple="multiple"
                                v-bind="item.table"
                                v-else-if="item.searchType === 'table'"
                            />

                        </n-search-item>
                    </template>
                </template>
            </div>
        </q-scroll-area>

        <!-- 底部 -->
        <q-toolbar
            class="q-footer q-footer--bordered"
            :class="{
                'bg-grey-2': ! $q.dark.isActive,
            }"
        >
            <div class="row n-flex-1 q-gutter-sm">
                <q-btn
                    class="n-flex-1"
                    color="default"
                    outline
                    label="搜索"
                    icon="search"
                    @click="onSearch"
                    unelevated
                />
                <q-btn
                    class="q-pl-md"
                    color="default"
                    outline
                    label="重置"
                    @click="onReset"
                    unelevated
                />
            </div>
        </q-toolbar>
    </div>
</template>

<script>
export default {

    /**
     * 标识
     */
    name: 'NSearch',
    /**
     * 声明属性
     */
    props: {
        // 值
        modelValue: Array,
        // 参数
        options: Array,
        // 搜索
        onSearch: Function,
        // 重置
        onReset: Function,
    },

    /**
     * 组合式
     */
    setup() {
        return {
            // 如果金额为分
            centToYuan: $n_config('priceCent') === true,
        }
    }
}
</script>
