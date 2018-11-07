
import  * as components from './*/index.vue'

const formatName = (name) => {
  const firstIndex = 0
  const deleteCount = 1
  const str = name.replace(/([A-Z])/g, '-$1').toLowerCase()
  return str.indexOf('-') === firstIndex ? str.substr(deleteCount) : str
}
const component = {
  install: function (Vue) { // eslint-disable-line
    for (const key in components) {

      if (components.hasOwnProperty(key)) {
        console.log(key)
        const c = components[key]
        Vue.component(formatName(c.name), c)
        console.log(`${formatName(c.name)} component registered ！`)
      }
    }
  },
}
// 导出该组件
export default component