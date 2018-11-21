
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
        const c = components[key]
        Vue.component(formatName(c.name), c)
        console.log(`${formatName(c.name)} component registered ！`)
      }
    }

    Vue.prototype.tool = {
      reTime: (val = new Date(), format = 'yy-mm-dd h:m:s') => {
        let date = val
        if (!date) { date = new Date() }
        const y = date.getFullYear()
        const m = date.getMonth() + 1
        const d = date.getDate()
        const H = date.getHours()
        const M = date.getMinutes()
        const S = date.getSeconds()
        return format.replace('yy', y)
          .replace('mm', m >= 10 ? m : `0${m}`)
          .replace('dd', d >= 10 ? d : `0${d}`)
          .replace('h', H >= 10 ? H : `0${H}`)
          .replace('m', M >= 10 ? M : `0${M}`)
          .replace('s', S >= 10 ? S : `0${S}`)
      },
    }
  },
}
// 导出该组件
export default component