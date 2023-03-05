# getData 获取公共数据

::: tip
`@netang/quasar/utils/getData.js` [Github](https://github.com/netangsoft/netang-quasar/blob/main/utils/getData.js) [Gitee](https://gitee.com/jinmarcus/netang-quasar/blob/main/utils/getData.js)
:::

- 请求公共数据地址设置

```javascript
import { settings } from '@netang/quasar/utils/config'

/**
 * 配置设置
 */
settings({
    // 用户配置
    userConfig: {
        apiDataUrl: '公共数据地址',
    },
})
```

- 示例

```javascript

// 页面状态
const pageStatus = ref(false)
// 空状态描述
const emptyDescription = ref('')
// 仓库列表
const warehouseLists = ref([])

// 获取仓库列表
const res1 = await getData('get_warehouse', pageStatus, emptyDescription, warehouseLists)
if (res1 === false) {
    return
}
console.log(warehouseLists.value)

// 获取获取多条公共数据
const res2 = await getData(['get_admin_group', 'get_admin_post', 'get_admin_role'], pageStatus, emptyDescription)
if (res2 === false) {
    return
}
console.log(res2[1], res2[2], res2[3])
```

- 类型

```javascript
await getData(url, pageStatus, emptyDescription, refValue)
```

| 参数名      | 说明 | 类型       | 默认值   |
|----------|--|----------|-------|
| url      | 请求地址 | `String` / `Array` | -     |
| pageStatus | 页面状态 | `ref(Boolean)` | - |
| emptyDescription | 空状态描述 | `ref(String)` | - |
| refValue | 请求成功后设置值 | `ref()` | - |
