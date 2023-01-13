<template>
    <template v-for="item in data">

        <!-- 如果有子菜单 -->
        <q-expansion-item
            :label="item.label"
            :group="`group-${level}`"
            v-model="item.expanded"
            :icon="item.attr.icon"
            v-if="item.children.length"
        >
            <n-list-menu-item
                :data="item.children"
                :level="level + 1"
                @item-click="onItemClick"
            />
        </q-expansion-item>

        <!-- 否则为单独的菜单 -->
        <q-item
            :active="item.expanded"
            active-class="text-white"
            @click="onItemClick(item)"
            clickable
            v-else
        >
            <q-item-section>
                <q-item-label>{{item.label}}</q-item-label>
            </q-item-section>
        </q-item>

    </template>
</template>

<script>
export default {

    /**
     * 标识
     */
    name: 'NListMenuItem',

    /**
     * 声明属性
     */
    props: {
        // 数据
        data: Array,
        // 层级
        level: {
            type: Number,
            default: 1,
        },
    },

    /**
     * 声明事件
     */
    emits: [
        // 单个元素点击
        'itemClick',
    ],

    /**
     * 组合式
     */
    setup(props, { emit }) {

        // ==========【返回】=========================================================================================

        return {
            // 单个元素点击
            onItemClick(item) {
                emit('itemClick', item)
            },
        }
    }
}
</script>
