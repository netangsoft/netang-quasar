# $form 表单

::: tip
`@netang/quasar/utils/$form.js` [Github](https://github.com/netangsoft/netang-quasar/blob/main/utils/%24form.js) [Gitee](https://gitee.com/jinmarcus/netang-quasar/blob/main/utils/%24form.js)

表单工具
:::

## $form.create

创建表格实例

- 类型

```javascript
$form.create(options: Object): Object
```

### options 参数

| 参数名       | 说明     | 类型         | 可选值 | 默认值 | 示例  |
|-----------|--------|------------|-----|-----|-----|
| $power    | 权限实例   | `Object`   | -   | -   | -   | 
| formData  | 初始表单数据 | `Object`   | -   | { } | -   | 
| resetForm | 重置表单方法 | `Function` | -   | -   | -   | 

### 返回数据

| 参数名         | 说明     | 类型            | 可在 `<q-form>` 组件中使用 |
|-------------|--------|---------------|---------------------|
| formRef     | 表单节点   | `ref()`       | ref="formRef"       |
| rawFormData | 原始表单数据 | `Object`      | -                   |
| formData    | 表单数据   | `ref(Object)` | -                   |
