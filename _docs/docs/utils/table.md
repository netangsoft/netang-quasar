# $table 表格

::: tip
`@netang/quasar/utils/$table.js` [Github](https://github.com/netangsoft/netang-quasar/blob/main/utils/%24table.js) [Gitee](https://gitee.com/jinmarcus/netang-quasar/blob/main/utils/%24table.js)

表格工具
:::

## $table.create

创建表格实例

- 类型

```javascript
$table.create(options: Object): Object
```

### options 参数

| 参数名                  | 说明             | 类型         | 可选值                                         | 默认值                                 | 示例  |
|----------------------|----------------|------------|---------------------------------------------|-------------------------------------|-----|
| path                 | 路由路径           | `String`   | -                                           | -                                   | -   |
| url                  | 请求地址(默认为 path) | `String`   | -                                           | -                                   | -   |
| query                | 路由参数           | `Object`   | -                                           | { }                                 | -   |
| data                 | 附加请求数据         | `Object`   | -                                           | { }                                 | -   |
| rowKey               | 表格行唯一键值        | `String`   | -                                           | id                                  | -   |
| selection            | 选择类型           | `String`   | `none` / `single` / `multiple`              | single                              | -   |
| separator            | 分隔栏            | `String`   | `horizontal` / `vertical` / `cell` / `none` | cell                                | -   |
| selected             | 初始已选数据         | `Array`    | -                                           | [ ]                                 | -   |
| loading              | 初始表格加载状态       | `Boolean`  | -                                           | false                               | -   |
| columns              | 表格列数据(对象数组)    | `Array`    | -                                           | [ ]                                 | -   |
| visibleColumns       | 初始可见列          | `Array`    | -                                           | [ ]                                 | -   |
| rows                 | 表格行数据          | `Array`    | -                                           | [ ]                                 | -   |
| pagination           | 表格翻页参数         | `Object`   | -                                           | -                                   | -   |
| rowsPerPageOptions   | 每页显示行数选项       | `Array`    | -                                           | [ 30, 40, 50, 100, 200, 500, 1000 ] | -   |
| request              | 自定义请求方法        | `Function` | -                                           | -                                   | -   |
| formatRow            | 格式化单条数据        | `Function` | -                                           | -                                   | -   |
| httpSettings         | http 设置        | `Object`   | -                                           | -                                   | -   |
| search               | 是否开启初始搜素       | `Boolean`  | -                                           | true                                | -   |
| summary              | 是否开启合计         | `Boolean`  | -                                           | false                               | -   |
| searchFromQuery      | 从参数中获取搜索值      | `Boolean`  | -                                           | true                                | -   |
| showGrid             | 是否显示宫格         | `Boolean`  | -                                           | true                                | -   |
| showVisibleColumns   | 是否显示可见列        | `Boolean`  | -                                           | true                                | -   |
| cache                | 是否开启缓存         | `Boolean`  | -                                           | true                                | -   |
| refreshResetSelected | 是否刷新后清空已选数据    | `Boolean`  | -                                           | true                                | -   |
| rowClick             | 单击表格行事件        | `Function` | -                                           | -                                   | -   |
| rowDblClick          | 双击表格行事件        | `Function` | -                                           | -                                   | -   |

#### pagination

表格翻页参数

| 参数名         | 说明          | 类型        | 默认值  |
|-------------|-------------|-----------|------|
| page        | 页码          | `Number`  | 1    |
| rowsPerPage | 每页的数据条数     | `Number`  | 30   |
| rowsNumber  | 数据总数(服务器返回) | `Number`  | 1    |
| sortBy      | 排序字段        | `String`  | null |
| descending  | 是否降序排列      | `Boolean` | true |

#### request

格式化表格按钮

```javascript
import http from '@netang/utils/http'

// 创建表格实例
const $table = $n.$table.create({

    // 自定义请求方法
    async request({ httpOptions, props, rows, selected }) {
        return await http(httpOptions)
    },
})
```

| 参数名         | 说明        | 类型       | 示例  |
|-------------|-----------|----------|-----|
| httpOptions | http 请求参数 | `Object` | -   |
| props       | 表格声明属性    | `Array`  | -   |
| rows        | 表格行数据     | `Array`  | -   |
| selected    | 表格已选数据    | `Array`  | -   |

#### formatRow

格式化单条数据

```javascript
// 创建表格实例
const $table = $n.$table.create({

    // 格式化单条数据
    formatRow({ row, rows, selected }) {
        row.title = '[测试]' + row.title
    },
})
```

| 参数名      | 说明     | 类型       | 示例  |
|----------|--------|----------|-----|
| row      | 当前单条数据 | `Object` | -   |
| rows     | 表格行数据  | `Array`  | -   |
| selected | 表格已选数据 | `Array`  | -   |

#### rowClick

单击表格行事件

```javascript
// 创建表格实例
const $table = $n.$table.create({

    // 单击表格行事件
    rowClick(evt, row, index) {

    },
})
```

#### rowDblClick

双击表格行事件

```javascript
// 创建表格实例
const $table = $n.$table.create({

    // 双击表格行事件
    rowDblClick(evt, row, index) {

    },
})
```

### 返回数据

返回的数据可提供给 `<q-table>` 使用

| 参数名                     | 说明               | 类型             | 可在 `<q-table>` 组件中使用                             |
|-------------------------|------------------|----------------|--------------------------------------------------|
| routeFullPath           | 当前路由全路径          | `String`       | -                                                |
| routePath               | 当前路由路径           | `String`       | -                                                |
| routeQuery              | 当前路由参数           | `Object`       | -                                                |
| getRoute                | 获取当前路由           | `Function`     | -                                                |
| tableLoading            | 表格加载状态           | `ref(Boolean)` | :loading="tableLoading"                          |
| tableRowKey             | 表格行唯一键值          | `String`       | :row-key="tableRowKey"                           |
| tableSelection          | 表格选择类型           | `ref(String)`  | :selection="tableSelection"                      |
| tableSeparator          | 表格分隔栏            | `ref(String)`  | :separator="tableSeparator"                      |
| tableRowsPerPageOptions | 表格每页显示行数选项       | `Array`        | :rows-per-page-options="tableRowsPerPageOptions" |
| tableColumns            | 表格列数据(对象数组)      | `Array`        | :columns="tableColumns"                          |
| tableVisibleColumns     | 表格可见列            | `ref(Array)`   | :visible-columns="tableVisibleColumns"           |
| tableRows               | 表格行数据            | `ref(Array)`   | :rows="tableRows"                                |
| tablePagination         | 表格翻页参数           | `ref(Object)`  | v-model:pagination="tablePagination"             |
| tableSelected           | 表格已选数据           | `ref(Array)`   | v-model:selected="tableSelected"                 |
| tableFixedPowerBtns     | 固定在右边的权限按钮列表     | `computed`     | -                                                |
| showTableFixed          | 是否显示固定在右边的权限按钮列表 | `computed`     | -                                                |
| tableImgNames           | 表格图片标识           | `ref(Array)`   | 可在插槽中使用                                          |
| tableGrid               | 表格宫格             | `ref(Boolean)` | :grid="tableGrid"                                |
| tableSummary            | 表格合计             | `ref(Object)`  | 可在插槽中使用                                          |
| tableSearchValue        | 表格搜索数据           | `ref(Array)`   | -                                                |
| tableSearchOptions      | 表格搜索参数           | `ref(Array)`   | -                                                |
| setQuery                | 设置表格传参           | `Function`     | -                                                |
| isTableLoaded           | 表格是否已加载          | `Function`     | -                                                |
| tableLoad               | 表格加载(只加载一次)      | `Function`     | -                                                |
| tableReload             | 表格重新加载           | `Function`     | -                                                |
| tableRefresh            | 表格刷新             | `Function`     | -                                                |
| tableSearchReset        | 表格搜索重置           | `Function`     | -                                                |
| getTableRequestData     | 获取表格请求数据         | `Function`     | -                                                |
| tableRequest            | 表格请求数据           | `Function`     | @request="tableRequest"                          |
| tableRowClick           | 表格单击表格行          | `Function`     | @row-click="tableRowClick"                       |
| tableRowDblclick        | 表格双击表格行          | `Function`     | @row-dblclick="currentTableRowDblclick"          |
| setTableSearchOptions   | 设置表格搜索参数         | `Function`     | -                                                |
| reCreate                | 重新创建表格           | `Function`     | -                                                |


## $table.config

获取表格配置

从 `src/tables` 文件夹中获取路由路径对应的表格配置

- 示例

```javascript
$table.config(routePath, path, defaultValue)
```

### options 参数

| 参数名          | 说明              | 类型       | 示例                |
|--------------|-----------------|----------|-------------------|
| routePath    | 路由路径            | `String` | goods/goods/index |
| path         | 配置字段            | `String` | columns           |
| defaultValue | 默认值（没有获取到配置时显示） | `Any`    | [ ]               |
