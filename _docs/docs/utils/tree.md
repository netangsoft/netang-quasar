# $tree 树

::: tip
`@netang/quasar/utils/$tree.js` [Github](https://github.com/netangsoft/netang-quasar/blob/main/utils/%24tree.js) [Gitee](https://gitee.com/jinmarcus/netang-quasar/blob/main/utils/%24tree.js)

树工具
:::

## $tree.create

创建树实例

- 类型

```javascript
$tree.create(options: Object): Object
```

### options 参数

| 参数名         | 说明         | 类型            | 默认值   | 示例  |
|-------------|------------|---------------|-------|-----|
| $power      | 权限实例       | `Object`      | -     | -   | -   | 
| path        | 路由路径       | `String`      | -     | -   |
| path        | 路由路径       | `String`      | -     | -   |
| query       | 路由参数       | `Object`      | -     | -   |
| nodes       | 树节点列表      | `ref(Array)`  | -     | -   |
| expanded    | 树展开节点      | `ref(Array)`  | -     | -   |
| rawFormData | 原始表单数据     | `Object`      | -     | -   |
| formData    | 表单数据       | `ref(Object)` | -     | -   |
| reload      | 重新加载       | `Function`    | -     | -   |
| cache       | 是否开启展开节点缓存 | `Boolean`     | false | -   |

### 返回数据

| 参数名              | 说明       | 类型         | 示例  |
|------------------|----------|------------|-----|
| routeFullPath    | 当前路由全路径  | `String`   | -   |
| routePath        | 当前路由路径   | `String`   | -   |
| routeQuery       | 当前路由参数   | `Object`   | -   |
| getRoute         | 获取当前路由   | `Function` | -   |
| [getNode](#getnode)         | 获取节点     | `Function` | -   |
| [updateNode](#updatenode)       | 更新节点     | `Function` | -   |
| [deleteNode](#deletenode)       | 删除节点     | `Function` | -   |
| [getMenuStatus](#getmenustatus)    | 获取菜单状态   | `Function` | -   |
| [menuClick](#menuclick)        | 菜单点击     | `Function` | -   |
| [getExpandedCache](#getexpandedcache) | 获取展开节点缓存 | `Function` | -   |
| [setExpandedCache](#setexpandedcache) | 设置展开节点缓存 | `Function` | -   |
| [expandAll](#expandall)        | 展开全部     | `Function` | -   |
| [collapseAll](#collapseall)      | 收起全部     | `Function` | -   |


#### getNode

获取节点

```javascript
$tree.getNode(nodeId)
```

| 参数名    | 说明     | 类型       |
|--------|--------|----------|
| nodeId | 树节点 ID | `Number` |


#### updateNode

更新节点

```javascript
$tree.updateNode(data)
```

| 参数名  | 说明     | 类型       |
|------|--------|----------|
| data | 新的表单数据 | `Object` |


#### deleteNode

删除节点

```javascript
$tree.deleteNode(nodeItem)
```

| 参数名      | 说明    | 类型       |
|----------|-------|----------|
| nodeItem | 树节点数据 | `Object` |


#### getMenuStatus

获取菜单状态

```javascript
$tree.getMenuStatus(options)
```

| 参数名        | 说明   | 类型       | 默认值     |
|------------|------|----------|---------|
| updateName | 更新标识 | `String` | update  |
| moveName   | 移动标识 | `String` | move    |
| copyName   | 复制标识 | `String` | copy    |
| deleteName | 删除标识 | `String` | realdel |
| statusName | 状态标识 | `String` | status  |

#### menuClick

菜单点击

```javascript
// 获取菜单状态
const menuStatus = computed(function() {
    return $tree.getMenuStatus()
})

$tree.menuClick({
    // 菜单类型
    type: 'update',
    // 节点
    node,
    // 菜单状态
    menuStatus,
})
```

| 参数名        | 说明                                | 类型         | 可选值                                                                                                |
|------------|-----------------------------------|------------|----------------------------------------------------------------------------------------------------|
| type       | 菜单类型                              | `String`   | `update` / `moveUp` / `moveIn` / `moveDown` / `copy` / `delete` / `statusDisable` / `statusNormal` |
| node       | 节点                                | `Object`   | -                                                                                                  |
| menuStatus | 菜单状态, 可从 $tree.getMenuStatus() 获取 | `computed` | -                                                                                                  |

#### getExpandedCache

获取展开节点缓存

```javascript
$tree.getExpandedCache(defaultValue): Array
```

| 参数名          | 说明  | 类型      | 
|--------------|-----|---------|
| defaultValue | 默认值 | `Array` | |


#### setExpandedCache

设置展开节点缓存

```javascript
$tree.setExpandedCache(expanded): Array
```

| 参数名      | 说明     | 类型      | 
|----------|--------|---------|
| expanded | 展开节点数组 | `Array` | |


#### expandAll

展开全部

```javascript
$tree.expandAll(): void
```

#### collapseAll

收起全部

```javascript
$tree.collapseAll(): void
```
