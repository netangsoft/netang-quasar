# Splitter 拆分器

::: tip
继承 `<q-splitter>` 所有特性
[中文文档](http://www.quasarchs.com/vue-components/splitter) [英文文档](https://quasar.dev/vue-components/splitter)
:::

| 属性名                     | 说明                                           | 类型                   | 可选值 | 默认值   |
|-------------------------|----------------------------------------------|----------------------|-----|-------|
| value / v-model         | 绑定值（必填）                                      | -                    | -   | -     |
| before / v-model:before | 显示前置插槽(如果非双向绑定，如 :before 并不会影响内部值变化，仅做初始值使用) | `Boolean`            | -   | true  |
| after / v-model:after   | 显示后置插槽(如果非双向绑定，如 :after 并不会影响内部值变化，仅做初始值使用)  | `Boolean`            | -   | true  |
| hide-before-in-mobile   | 手机模式隐藏前置插槽                                   | `Boolean`            | -   | false |
| hide-after-in-mobile    | 手机模式隐藏后插槽                                    | `Boolean`            | -   | false |
| cache                   | 是否开启缓存（如果为字符串, 则为缓存名）                        | `Boolean` / `String` | -   | false |
