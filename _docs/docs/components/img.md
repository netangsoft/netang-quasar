# Img 图片

::: tip
继承 `<q-img>` 所有特性
[中文文档](http://www.quasarchs.com/vue-components/img) [英文文档](https://quasar.dev/vue-components/img)
:::

示例

```javascript
<n-img 
    src="..."
/>
```

新增属性

| 属性名             | 说明                          | 类型                  | 可选值 | 默认值   |
|-----------------|-----------------------------|---------------------|-----|-------|
| round           | 是否为圆形                       | `Boolean`           | -   | false |
| rounded         | 是否为圆角                       | `Boolean`           | -   | false |
| error-size      | 错误尺寸（发生错误后如果没有定义宽高，则此参数为宽高） | `String` / `Number` | -   | 70    |
| error-icon-size | 错误图标大小                      | `Number`            | -   | md    |
| error-icon      | 错误图标                        | `String`            | -   | image |
| preview         | 是否点击放大预览                    | `Boolean`           | -   | false |
