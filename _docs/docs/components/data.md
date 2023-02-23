# Data 数据插槽

::: tip
数据插槽
:::

## 使用示例

### 基础示例

```html
<n-data :data="{ name: '张三', age: 23 }" v-slot="{ data }">
    <div>姓名: {{ data.name }}</div>
    <div>年龄: {{ data.age }}</div>
</n-data>
```

### 复杂示例

```html
<template>
    <n-data
        v-for="userId in userIds"
        :key="`data-item-${userId}`"
        :data="userAll[userId]"
        v-slot="{ data: userItem }"
    >
        <div>姓名: {{ userItem.name }}，年龄: {{ userItem.age }}</div>
    </n-data>
</template>

<script>
    export default {
        setup() {
            return {
                userIds: [11, 22, 33],
                userAll: {
                    11: { id: 11, name: '张三', age: 23 },
                    22: { id: 22, name: '李四', age: 33 },
                    33: { id: 33, name: '王五', age: 26 },
                },
            }
        }
    }
</script>
```

## Data API

### Data 属性

| 属性名  | 说明  | 类型  | 可选值 | 默认值 |
|------|-----|-----|-----|-----|
| data | 数据  | -   | -   | -   |

### Data 插槽

| 插槽名     | 说明   |
|---------|------|
| default | 默认插槽 |

### Data `default` 插槽 对外暴露的方法

| 属性名  | 说明  | 类型  | 示例  |
|------|-----|-----|-----|
| data | 数据  | -   | -   |
