# Uploader 上传器

::: tip
上传器
:::

| 属性名             | 说明                                   | 类型        | 可选值                                  | 默认值   |
|-----------------|--------------------------------------|-----------|--------------------------------------|-------|
| value / v-model | 绑定值（必填）                              | -         | -                                    | -     |
| type            | 上传文件类型                               | `String`  | `file` / `image` / `video` / `audio` | -     |
| count           | 上传文件数量（0 为不限）                        | `Number`  | -                                    | 0     |
| max-size        | 单个文件的最大大小（单位：MB）                     | `Number`  | -                                    | -     |
| exts            | 单个文件的限制后缀                            | `Array`   | -                                    | -     |
| value-array     | true：值格式为数组 / false：值格式为字符串          | `Boolean` | -                                    | false |
| load-info       | 是否初始加载文件信息（仅图片有效, 其他类型自动会加载文件信息）     | `Boolean` | -                                    | false |
| confirm         | 单文件上传提示（true：提示上传替换 / false：不提示直接替换） | `Boolean` | -                                    | false |
