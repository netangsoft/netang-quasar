# Dragger 拖拽

::: tip
拖拽
:::

| 属性名             | 说明      | 类型        | 可选值 | 默认值  |
|-----------------|---------|-----------|-----|------|
| value / v-model | 绑定值（必填） | `Array`   | -   | -    |
| drag            | 是否开启拖拽  | `Boolean` | -   | true |

### Dragger 插槽

| 插槽名                      | 说明   |
|--------------------------|------|
| default          | 默认插槽 |

### Dragger `default` 插槽 对外暴露的方法

| 属性名       | 说明     | 类型         | 示例  |
|-----------|--------|------------|-----|
| mousedown | 鼠标按下   | `Function` | -   |
| fromIndex | 拖拽原始索引 | `Number`   | -   |
| dragStart | 拖拽开始   | `Function` | -   |
| dragEnter | 拖拽进入   | `Function` | -   |
| dragEnd   | 拖拽结束   | `Function` | -   |
