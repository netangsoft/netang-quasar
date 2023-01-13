import { ref } from 'vue'
import { initAuthStore } from '../utils/auth'

/**
 * 公共变量
 */

// 角色数据
export const stateRole = ref({
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

// loading
export const stateLoading = ref(false)

// 网络是否在线
export const stateOnLine = ref(navigator.onLine)

// 管理员信息状态
export const stateAdminUserInfo = ref(initAuthStore())
