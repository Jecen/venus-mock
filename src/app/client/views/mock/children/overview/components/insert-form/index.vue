<template>
  <div class='cp insert-form'>
    <Drawer
      title='新增Api'
      :closable='false'
      :width='800'
      :value='value'
      @input='v => $emit("input", v)'>
      <div class='form-wrapper'>
        <host-form
          ref='host'
          :hosts='hosts'
          @update='h => host = h' />
      </div>
      <div class='form-wrapper'>
        <api-form
          ref='api'
          :host='host'
          :apis='coverHostId ? apiMap[`${coverHostId}`] : []'
          @update='a => api = a' />
      </div>
      <div class='form-wrapper'>
        <method-form />
      </div>
    </Drawer>
  </div>
</template>

<script>
import hostForm from './cell/host-form'
import apiForm from './cell/api-form'
import methodForm from './cell/method-from'
export default {
  name: 'InsertForm',
  components: {
    'host-form': hostForm,
    'api-form': apiForm,
    'method-form': methodForm,
  },
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    hosts: {
      type: Array,
      default: () => ([]),
    },
  },
  data() {
    return {
      coverHostId: '',
      apiMap: {},
      host: {},
      api: {},
    }
  },
  watch: {
    coverHostId: async function (id) {
      const apis = await this.$store.dispatch('mock/getHostOverviewData', { id: parseInt(id) })
      this.apiMap = {
        ...this.apiMap,
        [id]: apis,
      }
    },
  },
  methods: {
    show() {
      this.$emit('input', true)
    },
    dismiss() {
      this.$emit('dismiss')
    },
    initHostForm(data) {
      console.log(data)
    },
    initApiForm(data) {
      console.log(data)
    },
    initMethodForm(data) {
      console.log(data)
    },
  },
}
</script>

<style lang="scss" scoped>
.insert-form{

}
</style>
