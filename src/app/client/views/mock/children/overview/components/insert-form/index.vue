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
          <host-form ref='host' />
        </div>
        <div class='form-wrapper'>
          <api-form ref='api' />
        </div>
        <div class='form-wrapper'>
          <method-form ref='method' @methodChange='methodChange' />
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
import methodForm from './cell/method-form'
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
  methods: {
    show() {
      this.$emit('input', true)
    },
    dismiss() {
      this.$emit('dismiss')
    },
    methodChange(m) {
      this.saveDisable = !!m.id
    },
    async submit() {
      this.isSaveing = true
      const { host, api, method: methodField } = this.$store.getters['mock/insertField']
      const { params: { list: params }} = methodField
      const method = Object.assign({}, methodField)
      delete method['params']
      const idField = {
        projectId: parseInt(this.projectId),
      }
      try {
        if (!host.id) { // 新增 host
          const temp = Object.assign({}, host)
          delete temp.id
          temp['online'] = temp.online === 1
          idField['hostId'] = parseInt((await this.$store.dispatch('mock/insertHost', {
            ...temp,
            ...idField,

          })).insertHost)
        } else {
          idField['hostId'] = parseInt(host.id)
        }

        if (!api.id) { // 新增 host
          const temp = Object.assign({}, api)
          delete temp.id
          idField['apiId'] = parseInt((await this.$store.dispatch('mock/insertApi', {
            ...temp,
            ...idField,
          })).insertApi)
        } else {
          idField['apiId'] = parseInt(api.id)
        }

        const rspMethod = await this.$store.dispatch('mock/insertMethod', {
          ...method,
          ...idField,
          disable: false,
        })
        const { insertMethod: methodId } = rspMethod
        idField['methodId'] = parseInt(methodId)
        const rspParams = await this.$store.dispatch('mock/insertParams', params.map(p => {
          const temp = Object.assign({}, p)
          delete temp['index']
          return {
            ...temp,
            ...idField,
            mandatory: temp.mandatory === 1,
          }
        }))
        if (rspParams) {
          this.isSaveing = false
          this.$emit('submit')
          this.$refs.host.clear()
          this.$refs.api.clear()
          this.$refs.method.clear()
        }
      } catch (error) {
        this.isSaveing = false
      }
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
