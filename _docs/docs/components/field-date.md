# FieldDate 下拉选择日期

::: tip
继承 `<q-field>` 所有特性
[中文文档](http://www.quasarchs.com/vue-components/field) [英文文档](https://quasar.dev/vue-components/field)
:::

| 属性名               | 说明         | 类型                  | 可选值                                                                            | 默认值   |
|-------------------|------------|---------------------|--------------------------------------------------------------------------------|-------|
| value / v-model   | 绑定值（必填）    | -                   | -                                                                              | -     |
| end / v-model:end | 结束值        | `String` / `Number` | `year` / `month` / `day` / `time` / `datetime` / `daterange` / `datetimerange` | day   |
| is-end-date       | 是否截止日期     | `Boolean`           | -                                                                              | false |
| show-second       | 是否显示秒      | `Boolean`           | -                                                                              | false |
| format            | 显示在输入框中的格式 | `String`            | -                                                                              | label |
| value-format      | 绑定值的格式     | `String`            | -                                                                              | X     |
| placeholder       | 占位符        | `String`            | -                                                                              | -     |
