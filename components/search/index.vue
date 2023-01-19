<template>
    <div class="flex column absolute-full" v-if="utils.isValidArray(options)">
        <q-scroll-area class="n-flex-1">

            <div class="n-search q-pa-sm q-pt-md q-gutter-md">

                <template
                    v-for="(item, itemIndex) in options"
                >
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

                        <!-- 输入框 价格 -->
                        <n-input-price
                            class="n-field-fieldset"
                            :label="label"
                            v-model="modelValue[itemIndex][index].value"
                            dense
                            outlined
                            clearable
                            v-else-if="item.type === 'price'"
                        >
                            <!--<template v-slot:append>-->
                            <!--    <q-btn round dense flat icon="search" />-->
                            <!--</template>-->
                        </n-input-price>

                        <!-- 输入框 文字 -->
                        <q-input
                            class="n-field-fieldset"
                            :label="label"
                            v-model="modelValue[itemIndex][index].value"
                            dense
                            outlined
                            clearable
                            v-else-if="item.searchType === 'input'"
                        >
                            <!--<template v-slot:append>-->
                            <!--    <q-btn round dense flat icon="search" />-->
                            <!--</template>-->
                        </q-input>

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
                            clearable
                            accordion
                            :multiple="multiple"
                            v-bind="item.tree"
                            v-else-if="item.searchType === 'tree'"
                        />

                    </n-search-item>
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
}
</script>
