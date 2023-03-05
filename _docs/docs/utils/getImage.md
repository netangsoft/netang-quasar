# getImage 获取图片地址

::: tip
`@netang/quasar/utils/getImage.js` [Github](https://github.com/netangsoft/netang-quasar/blob/main/utils/getImage.js) [Gitee](https://gitee.com/jinmarcus/netang-quasar/blob/main/utils/getImage.js)
:::

- 示例

```javascript
getImage('https://www.baidu.com/img/PCtm_d9c8750bed0b3c7d089fa7d55720d6cf.png')
```

- 类型

```javascript
await getImage(src, options)
```

| 参数名      | 说明 | 类型       | 默认值   |
|----------|--|----------|-------|
| src      | 图片地址 | `String` / `Array` / `Object` | -     |
| options | 参数 | `Object` | - |

options 参数

| 参数名      | 说明 | 类型       | 默认值   |
|----------|--|----------|-------|
| w      | 图片宽 | `Number` | -     |
| h      | 图片高 | `Number` | -     |
| q      | 图片质量 | `Number` | 75     |
| format | 图片格式 | `String` | webp     |
| maxWidth | 图片最大宽度 | `Number` | - |
| zoom | 是否自动缩放 | `Boolean` | false |
