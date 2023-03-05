# TableSplitter 表格拆分器

::: tip
继承 [n-table]() 所有特性
:::

| 属性名                   | 说明                                          | 类型                   | 可选值 | 默认值      |
|-----------------------|---------------------------------------------|----------------------|-----|----------|
| value / v-model       | 绑定值（必填）                                     | -                    | -   | -        |
| reverse               | 反转插槽                                        | `Boolean`            | -   | false    |
| unit                  | 模型的 CSS 单位                                  | `String`             | -   | %        |
| limits                | 两个值的数组，表示两个面板的最小和最大分割大小                     | `Array`              | -   | -        |
| horizontal            | 是否水平拆分                                      | `Boolean`            | -   | false    |
| after / v-model:after | 显示后置插槽(如果非双向绑定，如 :after 并不会影响内部值变化，仅做初始值使用) | `Boolean`            | -   | true     |
| hide-after-in-mobile  | 手机模式隐藏后插槽                                   | `Boolean`            | -   | false    |
| cache                 | 是否开启缓存（如果为字符串, 则为缓存名）                       | `Boolean` / `String` | -   | false    |
| tooltip               | 工具提示                                        | `String`             | -   | 是否显示详情   |
| renderPath            | 渲染组件路径（必填）                                  | `String`             | -   | -        |
| renderDescription     | 渲染空状态描述                                     | `String`             | -   | 没有找到任何数据 |
| noRendPageName        | 不需要加载渲染页面标识参数                               | `Boolean`            | -   | false    |
