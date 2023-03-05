import { ref } from 'vue'
import { initAuthStore } from '../utils/useAuth'

/**
 * 公共变量
 */

// 权限数据
export const statePower = ref({
    // 角色权限版本
    v: null,
    // all id
    all: {},
    // 页面
    urls: {},
    // 按钮
    btns: {},
    // 菜单
    menus: [],
})

// 时间差
export const stateTimeDiff = ref(0)

// 网络是否在线
// export const stateOnLine = ref(navigator.onLine)

// 用户信息状态
export const stateUserInfo = ref(initAuthStore())
