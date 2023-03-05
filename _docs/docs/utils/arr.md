# arr 操作数组

::: tip
`@netang/quasar/utils/arr.js` [Github](https://github.com/netangsoft/netang-quasar/blob/main/utils/arr.js) [Gitee](https://gitee.com/jinmarcus/netang-quasar/blob/main/utils/arr.js)
:::

- 示例

```html
<div class="col-xs-12 col-md-auto text-grey-8">
    <q-btn icon="add" class="q-mr-xs" size="12px" flat dense round @click="arr.add(formData.params, itemIndex, createNode)" />
    <q-btn icon="remove" class="q-mr-xs" size="12px" flat dense round @click="arr.delete(formData.params, itemIndex)" :disable="formData.params.length <= 1" />
    <q-btn icon="expand_less" class="q-mr-xs" size="12px" flat dense round @click="arr.up(formData.params, itemIndex)" :disable="itemIndex === 0" />
    <q-btn icon="expand_more" class="q-mr-xs" size="12px" flat dense round @click="arr.down(formData.params, itemIndex)" :disable="formData.params.length <= itemIndex + 1" />
</div>
```

### arr.add

数组添加值

- 类型

```javascript
arr.add(children, index, newItem)
```

| 参数名      | 说明   | 类型                 | 默认值 |
|----------|------|--------------------|-----|
| children | 操作数组 | `Array`            | -   |
| index    | 数组索引 | `Number`           | -   |
| newItem  | 添加值  | `Any` / `Function` | -   |


### arr.delete

数组删除值

- 类型

```javascript
arr.delete(children, index)
```

| 参数名      | 说明   | 类型                 | 默认值 |
|----------|------|--------------------|-----|
| children | 操作数组 | `Array`            | -   |
| index    | 数组索引 | `Number`           | -   |


### arr.up

数组值上移

- 类型

```javascript
arr.up(children, index)
```

| 参数名      | 说明   | 类型                 | 默认值 |
|----------|------|--------------------|-----|
| children | 操作数组 | `Array`            | -   |
| index    | 数组索引 | `Number`           | -   |


### arr.down

数组值下移

- 类型

```javascript
arr.down(children, index)
```

| 参数名      | 说明   | 类型                 | 默认值 |
|----------|------|--------------------|-----|
| children | 操作数组 | `Array`            | -   |
| index    | 数组索引 | `Number`           | -   |
