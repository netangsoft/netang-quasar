# uploader 上传器

::: tip
`@netang/quasar/utils/uploader.js` [Github](https://github.com/netangsoft/netang-quasar/blob/main/utils/uploader.js) [Gitee](https://gitee.com/jinmarcus/netang-quasar/blob/main/utils/uploader.js)

配合组件 [`<n-uploader>`](../components/uploader.md) 使用
:::

- 类型

```javascript
uploader(options: Object): void
```

| 参数名     | 说明  | 类型                 | 可选值 | 默认值 |
|---------|-----|--------------------|--|-----|
| fileRef | 上传文件输入框节点  | `ref()` | -  | -    |
| modelValue | 值  | `String` / `Array` | -  | -    |
| type | 上传文件类型  | `String` | `file` / `image` / `video` / `audio` |  image   |
| count | 上传文件数量(0:不限)  | `Number` | - |  0   |
| maxSize | 单个文件的最大大小(单位: MB) | `Number` | - |  0   |
| exts | 单个文件的限制后缀 | `Array` | - |  [ ]   |
| valueArray | 值是否为数组 | `Boolean` | - |  false   |
| unique | 是否去重 | `Boolean` | - |  false   |
| loadInfo | 是否初始加载文件信息(仅图片有效, 其他类型自动会加载文件信息) | `Boolean` | - |  false   |
| confirm | 单文件上传提示 | `Boolean` | - |  false   |
| uploadFileLists | 上传文件列表 | `ref(Array)` | - |  -   |
| onUpdateModelValue | 更新值方法(初始化上传列表时不更新值) | `Function` | - |  -   |
| onUpdate | 更新方法 | `Function` | - |  -   |
