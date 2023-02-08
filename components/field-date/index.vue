<template>
    <q-field
        :model-value="modelValue"
        :readonly="readonly"
        @clear="onClear"
        v-bind="$attrs"
    >
        <template v-slot:control>

            <!-- 显示值 -->
            <div v-if="showValue">{{showValue}}</div>

            <!-- 显示占位符 -->
            <div class="n-placeholder" v-else-if="placeholder">{{placeholder}}</div>
        </template>

        <template v-slot:before v-if="$slots.before">
            <slot name="before" />
        </template>
        <template v-slot:prepend v-if="$slots.prepend">
            <slot name="prepend" />
        </template>
        <template v-slot:append v-if="$slots.append">
            <slot name="append" />
        </template>
        <template v-slot:after v-if="$slots.after">
            <slot name="after" />
        </template>

        <q-popup-proxy
            ref="popupRef"
            no-refocus
            no-focus
            @before-show="onPopupBeforeShow"
            @hide="onPopupHide"
            v-if="! readonly"
        >
            <!-- 单选 -->
            <template v-if="isSelect">
                <div class="date__select">
                    <div class="row flex">
                        <q-scroll-area
                            ref="scrollRef"
                            :style="{
                                width: selectLists.length === 1 ? '136px' : '80px',
                                height: '300px'
                            }"
                            v-for="(selectItem, selectItemIndex) in selectLists"
                            :key="`list-${selectItemIndex}`"
                        >
                            <q-list>
                                <q-item
                                    v-for="(item, itemIndex) in selectItem.lists"
                                    :key="`item-${selectItemIndex}-${itemIndex}`"
                                    :active="dateValue[selectItem.type] !== '' && dateValue[selectItem.type] == item[0]"
                                    :active-class="$q.dark.isActive ? 'bg-grey-14 text-white' : 'bg-grey-3 text-dark'"
                                    @click="onSelect(selectItem.type, item[0])"
                                    dense
                                    clickable
                                >
                                    <q-item-section>{{item[1]}}</q-item-section>
                                </q-item>
                            </q-list>
                        </q-scroll-area>
                    </div>

                    <!-- 底部按钮 -->
                    <div class="date__footer row items-center justify-end q-pa-sm" v-if="type !== 'year'">
                        <q-btn label="取消" color="primary" flat @click="onCancel" v-close-popup />
                        <q-btn label="确定" color="primary" flat v-close-popup />
                    </div>
                </div>
            </template>

            <!-- 选择日期范围 -->
            <q-date
                :model-value="dateValue"
                :range="isRange"
                @update:model-value="onUpdateDateValue"
                minimal
                v-else
            >
                <div class="date__time row q-gutter-sm" v-if="isDatetime">
                    <q-input
                        class="n-field-fieldset n-flex-1"
                        :model-value="timeValue.from"
                        @update:model-value="onUpdateTimeValueFrom"
                        outlined
                        :label="type === 'datetimerange' ? `时间 起` : '选择时间'"
                        stack-label
                        type="time"
                        :step="showSecond ? '1' : '0'"
                        dense
                    />
                    <q-input
                        class="n-field-fieldset n-flex-1"
                        :model-value="timeValue.to"
                        @update:model-value="onUpdateTimeValueTo"
                        outlined
                        label="时间 止"
                        stack-label
                        :step="showSecond ? '1' : '0'"
                        type="time"
                        dense
                        v-if="type === 'datetimerange'"
                    />
                </div>

                <!-- 操作 -->
                <div class="date__settings" v-if="isRange">
                    <q-scroll-area style="height:40px;">
                        <div class="row no-wrap">
                            <q-chip
                                v-for="(item, index) in quickRange"
                                :key="`quick-${index}`"
                                size="sm"
                                :ripple="false"
                                clickable
                                @click="onQuickRange(index)"
                                flat
                            >{{item}}</q-chip>
                        </div>
                    </q-scroll-area>
                </div>

                <!-- 底部按钮 -->
                <div class="date__settings row items-center justify-end" v-if="isDatetime || type === 'daterange'">
                    <q-btn label="取消" color="primary" flat @click="onCancel" v-close-popup />
                    <q-btn label="确定" color="primary" flat v-close-popup />
                </div>
            </q-date>

        </q-popup-proxy>
    </q-field>
</template>

<script>
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { date as quasarDate } from 'quasar'

import $n_padStart from 'lodash/padStart'
import $n_isNil from 'lodash/isNil'

import $n_forEach from '@netang/utils/forEach'
import $n_indexOf from '@netang/utils/indexOf'
import $n_isRequired from '@netang/utils/isRequired'
import $n_isValidValue from '@netang/utils/isValidValue'
import $n_numberDeep from '@netang/utils/numberDeep'
import $n_isDate from '@netang/utils/isDate'
import $n_dateObject from '@netang/utils/dateObject'
import $n_ymd from '@netang/utils/ymd'

import { quickRange, getQuickRange } from './methods'

export default {

    /**
     * 标识
     */
    name: 'NFieldDate',

    /**
     * 声明属性
     */
    props: {
        // 值 v-model
        modelValue: {
            required: true,
        },
        // 结束值
        end: [String, Number],
        // 类型, 可选值 year month day time datetime daterange datetimerange
        type: {
            type: String,
            default: 'day',
        },
        // 是否截止日期
        isEndDate: Boolean,
        // 是否显示秒
        showSecond: Boolean,
        // 显示在输入框中的格式
        format: String,
        // 绑定值的格式(默认:秒时间戳)
        // 格式 YYYY-MM-DD HH:mm:ss
        valueFormat: {
            type: String,
            default: 'X',
        },
        // 占位符
        placeholder: String,
        // 是否只读
        readonly: Boolean,
    },

    /**
     * 声明事件
     */
    emits: [
        'update:modelValue',
        'update:end',
    ],

    /**
     * 组合式
     */
    setup(props, { emit }) {

        // ==========【计算属性】=========================================================================================

        // 是否为选择
        const isSelect = computed(function() {
            return $n_indexOf(['year', 'month', 'time'], props.type) > -1
        })

        // 是否为范围
        const isRange = computed(function() {
            return $n_indexOf(['daterange', 'datetimerange'], props.type) > -1
        })

        // 是否为选择时间
        const isDatetime = computed(function() {
            return $n_indexOf(['datetime', 'datetimerange'], props.type) > -1
        })

        // 选择数据列表
        const selectLists = computed(function () {

            const arr = []

            // 如果是选择时间
            if (props.type === 'time') {
                const hh = {
                    type: 'hh',
                    lists: []
                }
                for (let i = 0; i <= 23; i++) {
                    hh.lists.push([i, $n_padStart(String(i), 2, '0')])
                }
                const ii = {
                    type: 'ii',
                    lists: []
                }
                for (let i = 0; i <= 59; i++) {
                    ii.lists.push([i, $n_padStart(String(i), 2, '0')])
                }
                arr.push(hh, ii)
                if (props.showSecond) {
                    const ss = {
                        type: 'ss',
                        lists: []
                    }
                    for (let i = 0; i <= 59; i++) {
                        ss.lists.push([i, $n_padStart(String(i), 2, '0')])
                    }
                    arr.push(ss)
                }

                return arr
            }

            // 如果是选择年
            const year = new Date().getFullYear()

            const y = {
                type: 'y',
                lists: []
            }
            for (let j = year + 10; j >= year - 80; j--) {
                y.lists.push([j, j])
            }
            arr.push(y)

            if (props.type === 'year') {
                return arr
            }

            const mm = {
                type: 'mm',
                lists: []
            }
            for (let i = 1; i <= 12; i++) {
                mm.lists.push([i, $n_padStart(String(i), 2, '0')])
            }

            arr.push(mm)

            return arr
        })

        // ==========【数据】============================================================================================

        // 弹出层节点
        const popupRef = ref(null)

        // 滚动层节点
        const scrollRef = ref(null)

        // 日期值
        const dateValue = ref(formatDateValue())

        // 时间值
        const timeValue = reactive(formatTimeValue())

        // 显示值
        const showValue = ref(updateValue(dateValue.value, timeValue, false))

        // 记录原始值
        let oldModelValue = props.modelValue
        let oldEnd = props.end

        // ==========【监听数据】=========================================================================================

        /**
         * 监听声明值
         */
        watch([()=>props.modelValue, ()=>props.end, ()=>props.type], function() {
            dateValue.value = formatDateValue()
            Object.assign(timeValue, formatTimeValue())

            showValue.value = updateValue(dateValue.value, timeValue, false)
        })

        // ==========【方法】=============================================================================================

        /**
         * 格式化日期值
         */
        function formatDateValue() {

            let val = props.modelValue
            if (val === null) {
                return null
            }

            // 如果是选择数据
            if (isSelect.value) {

                const obj = {}

                // 如果是选择时间
                if (props.type === 'time') {

                    // 初始化时间数据
                    Object.assign(obj, {
                        hh: '',
                        ii: '',
                    })

                    // 如果是这种格式 06:59 的时间
                    if (
                        ! $n_isDate(val)
                        && $n_indexOf(val, ':') > -1
                    ) {
                        val = quasarDate.formatDate(Date.now(), `YYYY-MM-DD ${val}`)
                    }

                    if ($n_isDate(val)) {

                        const { hh, ii, ss } = $n_dateObject(val)

                        // 设置时间数据
                        Object.assign(obj, {
                            hh,
                            ii,
                        })

                        // 设置秒数据
                        if (props.showSecond) {
                            obj.ss = ss
                        }

                    } else if (props.showSecond) {
                        obj.ss = ''
                    }

                // 否则是选择年月
                } else {

                    obj.y = ''

                    // 如果是选择年
                    if (props.type === 'year') {

                        // 如果有值
                        if (val) {

                            // 如果值长度为 4
                            if (String(val).length === 4) {
                                obj.y = val

                            // 否则如果是日期格式
                            } else if ($n_isDate(val)) {
                                const { y } = $n_dateObject(val)
                                obj.y = y
                            }
                        }

                        return obj
                    }

                    // 否则是选择月

                    // 如果是这样的格式 202207, 则转换为 2022-07
                    const newVal = $n_ymd.toString(val)
                    if (newVal) {
                        val = newVal
                    }

                    if ($n_isDate(val)) {
                        const { y, mm } = $n_dateObject(val)
                        Object.assign(obj, {
                            y,
                            mm,
                        })
                    } else {
                        obj.mm = ''
                    }
                }

                return obj
            }

            // 否则是日期选择
            let from = ''
            let to = ''

            // 如果是这样的格式 20220708, 则转换为 2022-07-08
            const newVal = $n_ymd.toString(val)
            if (newVal) {
                val = newVal
            }

            if ($n_isDate(val)) {
                const { y, mm, dd } = $n_dateObject(val)
                from = `${y}/${mm}/${dd}`

                // 如果不是日期选择范围, 则返回单个日期
                if (! isRange.value) {
                    return from
                }
            }

            // 如果是日期选择范围
            if (isRange.value && $n_isDate(props.end)) {
                const { y, mm, dd } = $n_dateObject(props.end)
                to = `${y}/${mm}/${dd}`
            }

            return {
                from,
                to,
            }
        }

        /**
         * 格式化时间值
         */
        function formatTimeValue() {

            const obj = {
                from: '',
                to: '',
            }

            if ($n_isDate(props.modelValue)) {
                const { hh, ii, ss } = $n_dateObject(props.modelValue)
                obj.from = `${hh}:${ii}`
                if (props.showSecond) {
                    obj.from += `:${ss}`
                }

            // 如果不是范围日期 && 是结束日期
            } else if (! isRange.value && props.isEndDate) {
                obj.from = props.showSecond ? '23:59:59' : '23:59'
            } else {
                obj.from = props.showSecond ? '00:00:00' : '00:00'
            }

            if (isRange.value && $n_isDate(props.end)) {
                const { hh, ii, ss } = $n_dateObject(props.end)
                obj.to = `${hh}:${ii}`
                if (props.showSecond) {
                    obj.to += `:${ss}`
                }
            } else {
                obj.to = props.showSecond ? '23:59:59' : '23:59'
            }

            return obj
        }

        /**
         * 更新值
         */
        function updateValue(dateValue, timeValue, isEmit = true) {

            let format = ''

            if (isSelect.value) {

                let val = ''

                // 如果是选择时间
                if (props.type === 'time') {

                    if (! $n_isValidValue(dateValue.hh) && ! $n_isValidValue(dateValue.ii)) {
                        return ''
                    }

                    format = 'HH:mm'
                    if (props.showSecond) {
                        format += ':ss'
                    }
                    val = quasarDate.formatDate(Date.now(), `YYYY-MM-DD ${dateValue.hh !== '' ? dateValue.hh : '00'}:${dateValue.ii !== '' ? dateValue.ii : '00'}${props.showSecond && dateValue.ss !== '' ? dateValue.ss : (props.isEndDate ? ':59' : ':00')}`)

                // 否则是选择年月
                } else {
                    if (! $n_isValidValue(dateValue.y)) {
                        return ''
                    }

                    const isMonth = props.type === 'month'
                    if (isMonth) {
                        if (! $n_isValidValue(dateValue.mm)) {
                            return ''
                        }

                        format = 'YYYY-MM'
                        val = quasarDate[props.isEndDate ? 'endOfDate' : 'startOfDate'](new Date(`${dateValue.y}-${dateValue.mm}`), 'month')

                    } else {
                        format = 'YYYY'
                        val = quasarDate[props.isEndDate ? 'endOfDate' : 'startOfDate'](new Date(`${dateValue.y}-01`), 'year')
                    }
                }

                if (props.format) {
                    format = props.format
                }

                if (isEmit) {
                    onEmit('update:modelValue', quasarDate.formatDate(val, props.valueFormat))
                } else {
                    return quasarDate.formatDate(val, format)
                }
                return ''
            }

            if (! $n_isRequired(dateValue)) {
                return ''
            }

            if (isRange.value) {

                let {
                    from,
                    to,
                } = dateValue

                if (
                    ! $n_isValidValue(from)
                    || ! $n_isValidValue(to)
                ) {
                    return ''
                }

                from += ' '
                to += ' '
                format = 'YYYY-MM-DD'

                if (props.type === 'datetimerange') {
                    from += `${timeValue.from}`
                    to += `${timeValue.to}`
                    format += ' HH:mm'
                    if (props.showSecond) {
                        format += ':ss'
                    } else {
                        from += ':59'
                        to += ':59'
                    }

                } else {
                    from += `00:00`
                    to += `23:59`
                    if (! props.showSecond) {
                        from += ':00'
                        to += ':59'
                    }
                }
                if (props.format) {
                    format = props.format
                }

                if (isEmit) {
                    onEmit('update:modelValue', quasarDate.formatDate(from, props.valueFormat))
                    onEmit('update:end', quasarDate.formatDate(to, props.valueFormat))
                } else {
                    return quasarDate.formatDate(from, format) + ' - ' + quasarDate.formatDate(to, format)
                }
                return ''
            }

            let from = `${dateValue} `
            format = 'YYYY-MM-DD'

            if (props.type === 'datetime') {
                from += `${timeValue.from}`
                format += ' HH:mm'
                if (props.showSecond) {
                    format += ':ss'
                } else {
                    from += (props.isEndDate ? ':59' : ':00')
                }
            } else {
                from += (props.isEndDate ? '23:59' : '00:00')
                if (! props.showSecond) {
                    from += (props.isEndDate ? ':59' : ':00')
                }
            }
            if (props.format) {
                format = props.format
            }

            if (isEmit) {
                onEmit('update:modelValue', quasarDate.formatDate(from, props.valueFormat))
            } else {
                return quasarDate.formatDate(from, format)
            }

            return ''
        }

        /**
         * 更新日期后回调
         */
        function onUpdateDateValue(val) {

            // 如果为 null, 则清空数据
            if ($n_isNil(val)) {
                emit('update:modelValue', null)
                if (isRange.value) {
                    emit('update:end', null)
                }

            } else {
                updateValue(val, timeValue)
            }

            // 如是类型是天
            if (props.type === 'day') {
                // 则关闭弹出层
                popupRef.value.hide()
            }
        }

        /**
         * 更新日期时间起回调
         */
        function onUpdateTimeValueFrom(from) {
            updateValue(dateValue.value, Object.assign({}, timeValue, {
                from,
            }))
        }

        /**
         * 更新日期时间止回调
         */
        function onUpdateTimeValueTo(to) {
            updateValue(dateValue.value, Object.assign({}, timeValue, {
                to,
            }))
        }

        /**
         * 选择
         */
        function onSelect(type, value) {

            // 更新值
            const newValue = {}
            newValue[type] = value

            updateValue(Object.assign({}, dateValue.value, newValue), timeValue)

            // 如是类型是年
            if (props.type === 'year') {
                // 则关闭弹出层
                popupRef.value.hide()
            }
        }

        /**
         * 快捷范围
         */
        function onQuickRange(index) {

            const {
                date,
                time,
            } = getQuickRange(index, props.showSecond)

            if (date) {
                updateValue(date, time)
            }
        }

        /**
         * 取消
         */
        function onCancel() {
            // 还原原始值
            onEmit('update:modelValue', oldModelValue)
            if (isRange.value) {
                onEmit('update:end', oldEnd)
            }
        }

        /**
         * 提交
         */
        function onEmit(key, value) {
            emit(key, $n_numberDeep(value))
        }

        /**
         * 弹出层显示前回调
         */
        function onPopupBeforeShow() {

            // 如果为选择
            if (isSelect.value) {
                // 下次 DOM 更新
                nextTick(function() {

                    // 遍历选择列表
                    $n_forEach(selectLists.value, function(selectItem, selectItemIndex) {
                        // 遍历选单个列表
                        $n_forEach(selectItem.lists, function(item, itemIndex) {
                            if (dateValue.value[selectItem.type] !== '' && dateValue.value[selectItem.type] == item[0]) {
                                scrollRef.value[selectItemIndex].setScrollPosition('vertical', 32 * itemIndex, 0)
                                return true
                            }
                        })
                    })

                })
            }
        }

        /**
         * 弹出层隐藏后回调
         */
        function onPopupHide() {

            // 更新原始值
            oldModelValue = props.modelValue
            if (isRange.value) {
                oldEnd = props.end
            }
        }

        /**
         * 清空
         */
        function onClear() {
            emit('update:modelValue', null)
            if (isRange.value) {
                emit('update:end', null)
            }
            popupRef.value.hide()
        }

        // ==========【返回】=============================================================================================

        return {
            // 是否为选择
            isSelect,
            // 是否为范围
            isRange,
            // 是否为选择时间
            isDatetime,
            // 选择数据列表
            selectLists,

            // 弹出层节点
            popupRef,
            // 滚动层节点
            scrollRef,
            // 日期值
            dateValue,
            // 时间值
            timeValue,
            // 显示值
            showValue,
            // 快捷范围
            quickRange,

            // 更新日期后回调
            onUpdateDateValue,
            // 更新日期时间起回调
            onUpdateTimeValueFrom,
            // 更新日期时间止回调
            onUpdateTimeValueTo,

            // 选择
            onSelect,
            // 快捷范围
            onQuickRange,
            // 取消
            onCancel,

            // 弹出层显示前回调
            onPopupBeforeShow,
            // 弹出层隐藏后回调
            onPopupHide,
            // 清空
            onClear,
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
