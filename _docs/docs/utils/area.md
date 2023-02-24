# area 提示框

::: tip
`@netang/quasar/utils/area.js` [Github](https://github.com/netangsoft/netang-quasar/blob/main/utils/area.js) [Gitee](https://gitee.com/jinmarcus/netang-quasar/blob/main/utils/area.js)

继承 `Dialog.create()` 所有特性
[中文文档](http://www.quasarchs.com/quasar-plugins/dialog) [英文文档](https://quasar.dev/quasar-plugins/dialog)
:::

## getData 获取地区数据

- 示例

```javascript
// 获取地区数据数据
await area.getData(3)
```

- 类型

```javascript
await getData(level, options): Array
```

| 参数名     | 说明                | 类型       | 可选值             | 默认值 |
|---------|-------------------|----------|-----------------|-----|
| level | 地区级别(1：省，2：市，3：区) | `Number` | `1` / `2` / `3` | 3   |
| options | 参数                | `Object` | -               | -   |

options 参数

| 参数名     | 说明                | 类型       | 可选值 | 默认值 |
|---------|-------------------|----------|-----|-----|
| ignore | 忽略地区 id | `Array`  | -   | [ ] |


## getInfo 获取地区详情

- 示例

```javascript
// 获取地区数据数据
await area.getInfo({
    // 第 3 级区编码
    code: 340202,
})
```

- 类型

```javascript
await getInfo(options): Object
```

| 参数名          | 说明                                         | 类型       | 可选值             | 默认值  |
|--------------|--------------------------------------------|----------|-----------------|------|
| areaData     | 地址数据（由 `area.getData()` 创建的数据）（如果为空，则重新获取） | `Object` | -               | null |
| level        | 地区级别                                       | `Number` | `1` / `2` / `3` | 3    |
| code         | 第 3 级区编码                                   | `Number` | -               | 0    |
| provinceText | 省文字                                        | `String` | -               | ""   |
| cityText     | 市文字                                        | `String` | -               | ""   |
| areaText     | 区文字                                        | `String` | -               | ""   |
| regionText   | 详细区域文字                                     | `String` | -               | ""   |

- 返回数据

返回数据示例

```javascript
{
    "id": 340202,
    "pid": 340200,
    "title": "镜湖区",
    "level": 3,
    "region": [
        {
            "id": 340000,
            "pid": 0,
            "title": "安徽省",
            "level": 1
        },
        {
            "id": 340200,
            "pid": 340000,
            "title": "芜湖市",
            "level": 2
        },
        {
            "id": 340202,
            "pid": 340200,
            "title": "镜湖区",
            "level": 3
        }
    ],
    "region_ids": [
        340000,
        340200,
        340202
    ],
    "region_text": "安徽省芜湖市镜湖区"
}
```

| 参数名         | 说明       | 类型       | 示例  |
|-------------|----------|----------|-----|
| id          | 当前编码     | `Number` | -   | -     |
| pid         | 上级编码     | `Number` | -   | -     |
| title       | 地区标题     | `String` | -   | -     |
| level       | 地区级别     | `Number` | -   | -     |
| region      | 地区对象数组   | `Array`  | -   | -     |
| region_ids  | 地区 id 数组 | `Array`  | -   | -     |
| region_text | 地区名称数组   | `Array`  | -   | -     |
