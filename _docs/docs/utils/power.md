# $power 权限

::: tip
`@netang/quasar/utils/$power.js` [Github](https://github.com/netangsoft/netang-quasar/blob/main/utils/%24power.js) [Gitee](https://gitee.com/jinmarcus/netang-quasar/blob/main/utils/%24power.js)

权限工具
:::

## $power.create

创建权限实例

- 类型

```javascript
$power.create(options: Object): Object
```

### options 参数

| 参数名                                 | 说明          | 类型         | 默认值                  | 可选值 | 示例  |
|-------------------------------------|-------------|------------|----------------------|-----|-----|
| path                                | 路由路径        | `String`   | -                    | -   | -   | 
| query                               | 路由参数        | `Object`   | -                    | -   | -   | 
| pageLoading                         | 是否加载页面      | `Boolean`  | false                | -   | -   | 
| pageStatus                          | 页面状态        | `Boolean`  | null                 | -   | -   | 
| emptyDescription                    | 空状态描述       | `String`   | -                    | -   | -   | 
| power                               | 是否开启权限      | `Boolean`  | true                 | -   | -   | 
| showPowerBtns                       | 是否显示权限按钮    | `Boolean`  | true                 | -   | -   | 
| showToolbarPowerBtns                | 是否显示工具栏权限按钮 | `Boolean`  | true                 | -   | -   | 
| [formatPowerBtns](#formatpowerbtns) | 格式化权限按钮     | `Function` | -                    | -   | -   | 
| leftDrawerIcon                      | 左边侧滑菜单图标    | `String`   | format_list_bulleted | -   | -   | 
| rightDrawerIcon                     | 右边侧滑菜单图标    | `search`   | -                    | -   | -   | 
| [requestBefore](#requestbefore)     | 请求前执行       | `Function` | -                    | -   | -   | 
| [requestSuccess](#requestsuccess)   | 请求成功执行      | `Function` | -                    | -   | -   | 
| [requestFail](#requestfail)         | 请求失败执行      | `Function` | -                    | -   | -   | 
| [requestAfter](#requestafter)       | 请求后执行       | `Function` | -                    | -   | -   | 

#### formatPowerBtns

格式化权限按钮

```javascript
// 创建权限实例
const $power = $n.$power.create({
    
    // 格式化权限按钮
    formatPowerBtns(item, isFixed, tableSelected) {
        
        // 如果有选中数据
        if (tableSelected.length) {
            
            // 获取选中数据的第一条
            // 类型
            const { type } = tableSelected[0]
            
            // 如果按钮名称是订单详情
            if (item.title === '订单详情') {
                
                // 如果是商品订单
                if (type === 1) {
                    // 修改跳转页面地址
                    item.data.toPage = '/order/order/view'
                    // 修改按钮名称
                    item.title = '订单详情'
                
                // 否则是退货订单
                } else {
                    // 修改跳转页面地址
                    item.data.toPage = '/order/refund/edit'
                    // 修改按钮名称
                    item.title = '退货详情'
                }
            
            // 如果按钮名称是订单包裹
            } else if (item.title === '订单包裹') {
                
                // 如果返回 false, 则该权限按钮不显示
                return false
            }
        }
    },
})
```

| 参数名              | 说明        | 类型        | 示例  |
|------------------|-------------|----------------|-----|
| powerBtn         | 单个权限按钮数据  | `Object`  | -    |
| isFixed          | 是否固定在表格列中 | `Boolean` | -    |
| tableSelected      | 表格选中数据    | `Array`   | -    |

#### requestBefore

请求前执行, 用于在请求前对数据进行一些验证或修改

```javascript
// 创建权限实例
const $power = $n.$power.create({
    
    // 请求前执行
    requestBefore({ options, requestData }) {
        
        // 如果没有标题
        if (requestData.title) {
            
            // 轻提示
            $n.toast({
                message: '名称不能为空',
            })
            
            // 如果返回 false, 则取消该请求
            return false
        }
        
        // 修改请求数据
        requestData.test_data = 123
    },
})
```

| 参数名         | 说明        | 类型       | 示例  |
|-------------|-----------|----------|-----|
| options     | 请求时的上下文参数 | `Object` | -   |
| requestData | 请求接口的数据   | `Object` | -   |

#### requestSuccess

请求成功执行, 请求成功后进行一些操作

```javascript
// 创建权限实例
const $power = $n.$power.create({
    
    // 请求成功执行
    requestSuccess({ options, requestData, next, data, response }) {
        
        if (data.type === 1) {
            
            // 如果返回 false, 则不会继续向下执行
            return false
        }
        
        // 确认框
        $n.confirm({
            message: '提交成功，确认继续执行吗？',
        })
            // 点击确认执行
            .onOk(function () {
                
                // 如果传值为 false, 则关闭请求成功的轻提示
                next(false)
            })
    },
})
```

| 参数名         | 说明        | 类型         | 示例  |
|-------------|-----------|------------|-----|
| options     | 请求时的上下文参数 | `Object`   | -   |
| requestData | 请求接口的数据   | `Object`   | -   |
| next        | 继续向下执行    | `Function` | -   |
| status      | 请求结果状态    | `Boolean`  | -   |
| data        | 请求返回数据    | `Any`      | -   |
| response    | 请求返回原始数据  | `Object`   | -   |

#### requestFail

请求失败执行

| 参数名         | 说明        | 类型         | 示例  |
|-------------|-----------|------------|-----|
| options     | 请求时的上下文参数 | `Object`   | -   |
| requestData | 请求接口的数据   | `Object`   | -   |
| status      | 请求结果状态    | `Boolean`  | -   |
| data        | 请求返回数据    | `Any`      | -   |
| response    | 请求返回原始数据  | `Object`   | -   |

#### requestAfter

请求后执行

| 参数名         | 说明        | 类型         | 示例  |
|-------------|-----------|------------|-----|
| options     | 请求时的上下文参数 | `Object`   | -   |
| requestData | 请求接口的数据   | `Object`   | -   |
| status      | 请求结果状态    | `Boolean`  | -   |
| data        | 请求返回数据    | `Any`      | -   |
| response    | 请求返回原始数据  | `Object`   | -   |


### 返回数据

| 参数名              | 说明          | 类型             | 示例  |
|------------------|-------------|----------------|-----|
| pageLoading      | 是否加载页面      | `ref(Boolean)` | -   |
| pageStatus       | 页面状态        | `ref(Boolean)` | -   |
| emptyDescription | 空状态描述       | `ref(String)`  | -   |
| routeFullPath    | 当前路由全路径     | `String`       | -   |
| routePath        | 当前路由路径      | `String`       | -   |
| routeQuery       | 当前路由参数      | `Object`       | -   |
| getRoute         | 获取当前路由      | `Function`     | -   |
| formatPowerBtns  | 格式化权限按钮     | `Function`     | -   |
| leftDrawer       | 左边侧滑菜单数据    | `Object`       | -   |
| rightDrawer      | 右边侧滑菜单数据    | `Object`       | -   |
| tableSelected    | 表格已选数据      | `ref(Array)`   | -   |
| uploader         | 上传器         | `Array`        | -   |
| checkUploading   | 检查是否上传中     | `Function`     | -   |
| powerPage        | 当前页面权限      | `Object`       | -   |
| powerBtns        | 当前页面权限按钮    | `ref(Array)`   | -   |
| toolbarPowerBtns | 当前页面工具栏权限按钮 | `ref(Array)`   | -   |
| powerBtnClick    | 权限按钮点击      | `Function`     | -   |
| update           | 更新数据        | `Function`     | -   |

#### powerBtns

单个权限按钮参数

| 参数名    | 说明                                | 类型        | 可选值                                                                   | 示例                     |
|--------|-----------------------------------|-----------|-----------------------------------------------------------------------|------------------------|
| id     | 按钮 ID                             | `Number`  | -                                                                     | -                      |
| pid    | 按钮上级 ID                           | `Number`  | -                                                                     | -                      |
| title  | 按钮名称                              | `String`  | -                                                                     | 保存                     |
| url    | 按钮链接                              | `String`  | -                                                                     | /goods/goods/edit_save |
| name   | 按钮标识(取 url 最后一级，相当于 PHP 控制器中的方法名) | `String`  | -                                                                     | edit_save              |
| type   | 按钮类型                              | `Number`  | `11` / `12` / `13` / `14` / `15` / `16` / `20`                        | -                      |
| color  | 按钮颜色                              | `String`  | `default` / `primary` / `secondary` / `info` / `warning` / `negative` | primary                |
| icon   | 按钮图标                              | `String`  | -                                                                     | save                   |
| is_log | 是否记录日志                            | `Number`  | `0` / `1`                                                             | -                      |
| hidden | 是否隐藏按钮                            | `Boolean` | -                                                                     | -                      |
| data   | 按钮参数                              | `Object`  | -                                                                     | -                      |

- data 按钮参数

| 参数名             | 说明                       | 类型                   | 可选值                               | 默认值    | 示例  |
|-----------------|--------------------------|----------------------|-----------------------------------|--------|-----|
| selection       | 列表选择类型                   | `String`             | `none` / `single` / `multiple`    | single | -   |
| show            | 显示类型                     | `String`             | `single` / `multiple` / `空(默认显示)` | -      | -   |
| noFromPageQuery | 禁止添加来源页面参数               | `Boolean`            | -                                 | false  | -   |
| toPage          | 跳转页面 / 重定向 URL           | `String`             | -                                 | -      | -   |
| fixed           | 是否固定列                    | `Boolean`            | -                                 | false  | -   |
| dbclick         | 是否双击                     | `Boolean`            | -                                 | false  | -   |
| confirm         | 是否确认（如果传字符串，则为确认提示的内容）   | `Boolean` / `String` | -                                 | false  | -   |
| confirmPassword | 是否确认密码（如果传字符串，则为确认提示的内容） | `Boolean` / `String` | -                                 | false  | -   |
| requestQuery    | 请求参数                     | `Object`             | -                                 | -      | -   |
| requestSuccess  | 请求成功执行                   | `Object`             | -                                 | -      | -   |
| params          | 自定义参数, 任意类型              | `Any`                | -                                 | -      | -   |

- requestQuery

请求参数

| 参数名  | 说明  | 类型                | 示例 |
|------  |-----|--------------------|--|
| list | 列表  | `String` / `Array` | [ "id", "sku_id AS sku" ] |
| query | 参数  | `String` / `Array` | [ "id", "sku_id AS sku", { "type": 1, "name": "age" } ] |


- requestSuccess

请求成功执行

| 参数名  | 说明  | 类型                | 可选值 |
|------  |-----|--------------------|--|
| type | 类型  | `String` | `close` / `closePush` / `closePushRefresh` / `resetForm` / `refreshList` |
| params | 参数  | `Any` | - |


## $power.setData

设置权限数据

- 类型

```javascript
$power.setData(options: Object): void
```

### options 参数

| 参数名  | 说明    | 类型       |
|------|-------|----------|
| rows | 路由路径  | `Array`  |
| v    | 权限版本号 | `Number` |


## $power.getData

获取权限数据

- 类型

```javascript
await $power.getData(): Object
```

### 返回数据

| 参数名  | 说明 | 类型       | 默认值  |
|------|--|----------|------|
| v    | 权限版本号 | `Number` | null |
| all | 以 id 为索引的权限数据对象 | `Object`  |      |
| urls | 以 url 为索引的权限数据对象 | `Object`  |      |
| btns | 以 url 为索引的权限按钮对象 | `Object`  |      |
| menus | 所有权限菜单数组 | `Array`  |      |


## $power.getPageData

获取权限数据

- 类型

```javascript
$power.getPageData($route): Object
```

### 返回数据

| 参数名  | 说明 | 类型       |
|------|--|----------|
| page    | 页面权限 | `Number` |
| btns | 页面权限按钮数组 | `Array`  |


## $power.formatBtns

格式化权限按钮

- 类型

```javascript
$power.formatBtns(powerBtns, filterBtns, toObject = false): Array
```

## $power.request

权限请求

- 类型

```javascript
await $power.request(powerBtns, filterBtns, toObject = false): void
```

| 参数名  | 说明 | 类型       |
|------|--|-----|
| powerBtn    | 权限按钮数据 | `Object` |
| tableSelected | 表格选中数据 | `Array`  |
| checkUploading | 检查是否正在上传文件 | `Function`  |
| [requestBefore](#requestbefore)     | 请求前执行       | `Function` |
| [requestSuccess](#requestsuccess)   | 请求成功执行      | `Function` |
| [requestFail](#requestfail)         | 请求失败执行      | `Function` |
| [requestAfter](#requestafter)       | 请求后执行       | `Function` |
