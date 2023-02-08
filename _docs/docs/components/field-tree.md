# FieldTree 下拉树

::: tip
继承 `<q-field>` 所有特性
[中文文档](http://www.quasarchs.com/vue-components/field) [英文文档](https://quasar.dev/vue-components/field)
:::

| 属性名                         | 说明                                    | 类型        | 可选值 | 默认值   |
|-----------------------------|---------------------------------------|-----------|-----|-------|
| value / v-model             | 绑定值(必填)                               | -         | -   | -     |
| expanded / v-model:expanded | 树展开节点                                 | `Array`   | -   | -     |
| nodes                       | 节点数组                                  | `String`  | -   | -     |
| nodeKey                     | 唯一的节点键值(必填)                           | `String`  | -   | id    |
| labelKey                    | 标签字段                                  | `String`  | -   | label |
| strict                      | 是否可选任意一级(true:可选任意一级, false: 仅能选叶子节点) | `Boolean` | -   | false |
| multiple                    | 是否多选                                  | `Boolean` | -   | false |
| accordion                   | 手风琴模式                                 | `Boolean` | -   | false |
| show-all-levels             | 是否显示选中值的完整路径                          | `Boolean` | -   | true  |
| filter                      | 是否开启筛选                                | `Boolean` | -   | false |
| collapse-tags               | 是否折叠标签(多选模式有效)                        | `Boolean` | -   | false |
| placeholder                 | 占位符                                   | `String`  | -   | -     |
