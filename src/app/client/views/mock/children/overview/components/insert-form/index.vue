<template>
  <div class='cp insert-form'>
    <Drawer
      class='insert-drawer'
      title='新增Api'
      :closable='false'
      :width='800'
      :value='value'
      @input='v => $emit("input", v)'>
      <div class='content'>
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
            :apis='apis'
            @update='a => api = a' />
        </div>
        <div class='form-wrapper'>
          <method-form ref='method' @methodChange='methodChange' :methods='methods' />
        </div>
        <div class='footer'>
          <Button
            :loading='isSaveing'
            type='primary'
            :disabled='saveDisable'
            @click='submit'>保存</Button>
        </div>
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
    projectId: {
      type: [String, Number],
      default: '',
    },
  },
  data() {
    return {
      coverHostId: '',
      apiMap: {},
      host: {},
      api: {},
      isSaveing: false,
      saveDisable: false,
    }
  },
  computed: {
    apis() {
      return this.host.id ? this.apiMap[`${this.host.id}`] : []
    },
    methods() {
      return this.api.methods || []
    },
  },
  watch: {
    host: async function ({ id }) {
      if (id) {
        const apis = await this.$store.dispatch('mock/getHostOverviewData', { id: parseInt(id) })
        this.apiMap = {
          ...this.apiMap,
          [id]: apis,
        }
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
    methodChange(m) {
      this.saveDisable = !!m.id
    },
    async submit() {
      this.isSaveing = true
      try {
        const hostData = await this.$refs.host.getData()
        !hostData.id && delete hostData['id']
        const apiData = await this.$refs.api.getData()
        !apiData.id && delete apiData['id']
        const methodData = await this.$refs.method.getData()
        Object.keys(methodData).forEach(m => {
          !methodData[m].id && delete methodData[m]['id']
          !methodData[m].name && delete methodData[m]
        })
        const success = await this.$store.dispatch('mock/addMockRule', {
          id: this.projectId,
          host: hostData,
          api: apiData,
          method: methodData,
        })
        console.log(success)
      } catch (error) {
        console.log(error)
      }
      this.isSaveing = false
    },
  },
}
</script>

<style lang="scss" scoped>
.insert-drawer{
  & /deep/ .ivu-drawer-body{
    padding: 0;
  }
  .content{
    padding: 16px;
    position: relative;
    height: 100%;
    padding-bottom: 50px;
    overflow: auto;
    .footer{
      position: absolute;
      padding: 0 16px;
      bottom: 0;
      height: 50px;
      left: 0;
      width: 100%;
      border-top: 1px solid #e5e6e7;
      text-align: right;
      line-height: 50px;
    }
  }
}
</style>
