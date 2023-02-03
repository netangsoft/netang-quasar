import configData from '@/configs/production.json'

// 【开发模式】
// --------------------------------------------------
// #if IS_DEBUG && IS_DEV
import configDataDev from '@/configs/development.json'
$n.merge(configData, configDataDev)
// #endif

// 【测试模式】
// --------------------------------------------------
// #if IS_DEBUG && IS_TEST
import configDataTest from '@/configs/testing.json'
$n.merge(configData, configDataTest)
// #endif

/**
 * 获取配置
 */
$n.config = function(key = '', defaultValue = '') {
    return key ? $n.get(configData, key, defaultValue) : configData
}
