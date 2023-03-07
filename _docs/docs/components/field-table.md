# FieldTable 下拉表格

::: tip
继承 `<q-field>` 所有特性
[中文文档](http://www.quasarchs.com/vue-components/field) [英文文档](https://quasar.dev/vue-components/field)
:::

## FieldTable API

### FieldTable 属性

| 属性名                      | 说明               | 类型                  | 可选值                                      | 默认值             |
|--------------------------|------------------|---------------------|------------------------------------------|-----------------|
| value / v-model          | 绑定值              | -                   | -                                        | -               |
| value-key                | 值字段              | `String`            | -                                        | -               |
| label-key                | 标签字段             | `String`            | -                                        | -               |
| value-type               | 值类型              | `String`            | `string` / `stringArray` / `objectArray` | objectArray     |
| value-separator          | 值分隔符             | `String`            | -                                        | ,               |
| path                     | 表格请求路由路径         | `String`            | -                                        | -               |
| url                      | 表格请求地址(默认为 path) | `String`            | -                                        | -               |
| query                    | 请求参数             | `object`            | -                                        | -               |
| data                     | 附加请求数据           | `object`            | -                                        | -               |
| no-default-load-selected | 初始不加载已选数据        | `Boolean`           | -                                        | false           |
| no-update-load-selected  | 更新值时不加载已选数据      | `Boolean`           | -                                        | false           |
| format-label             | 格式化显示标签          | `Function`          | -                                        | -               |
| show-keys                | 下拉表格显示的字段数组      | `Array`             | -                                        | `[ 值字段, 标签字段 ]` |
| hide-search-keys         | 隐藏搜索字段数组         | `Array`             | -                                        | -               |
| filter-key               | 默认筛选字段           | `Array`             | -                                        | `标签字段`          |
| filter                   | 是否开启筛选           | `Boolean`           | -                                        | false           |
| table-props              | 表格声明属性           | `Object`            | -                                        | -               |
| dialog-props             | 对话框声明属性          | `Object`            | -                                        | -               |
| no-dialog                | 关闭对话框            | `Boolean`           | -                                        | false           |
| columns                  | 表格列数据            | `Array`             | -                                        | -               |
| rows                     | 行数据              | `Array`             | -                                        | -               |
| multiple                 | 是否多选             | `Boolean`           | -                                        | false           |
| collapse-tags            | 多选模式下是否折叠标签      | `Boolean`           | -                                        | false           |
| placeholder              | 占位符              | `String`            | -                                        | -               |
| clearable                | 是否可清除            | `Boolean`           | -                                        | false           |
| disable                  | 是否禁用             | `Boolean`           | -                                        | false           |
| readonly                 | 是否只读             | `Boolean`           | -                                        | false           |
| input-debounce           | 输入防抖(毫秒)         | `Number` / `String` | -                                        | 500             |


### FieldTable 插槽

| 插槽名                      | 说明                                       |
|--------------------------|------------------------------------------|
| default          | 自定义默认内容（如果存在，则会隐藏下拉表格，并提供接口自定义实现） |

### FieldTable `default` 插槽 对外暴露的方法

| 属性名                      | 说明 | 类型       | 示例  |
|--------------------------|--|----------|-----|
| showValue          | 显示的已选值 | `String` | -   |
| selected                | 已选数据 | `Array`  | `[ { id: 1, ... }, { id: 2, ... } ]`   |
| onRemove                | 删除已选 | `Function`  | `onRemove(index)`   |
| onShowDialog                | 显示对话框 | `Function`  | -   |
| onClear                | 清空已选数据 | `Function`  | -   |
