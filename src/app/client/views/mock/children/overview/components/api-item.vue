<template>
  <div class='cp api-item' :style='host.online ? "" : `filter: grayscale(100%);`' v-if='api'>
    <p class='api-name'>
      <a @click='() => {apiModal = true}'>{{api.name}}</a>
      <RadioGroup
        class='radio'
        size='small'
        v-model='apiType'
        @input='(val) => updateApi({type: val})'
        type='button'>
        <Radio v-for='opt in typeDict.options' :key='opt.id' :label='opt.id'>{{opt.name}}</Radio>
      </RadioGroup>
      <span class='url' @click='copyUrl'>{{host.protocolName}}://{{host.host}}{{host.path}}{{api.url}}</span>
    </p>
    <p class='method-box'>
      <span class='des'>Method: </span>
      <Poptip
        class='btn-pop'
        v-for='m in methods'
        :key='m.id'
        trigger='hover'
        word-wrap
        :content='m.name'
        transfer>
        <Button
          class='method-btn'
          size='small'
          @click='showMethod(m)'
          type='text'>
          {{m.methodName.toUpperCase()}}
        </Button>
      </Poptip>
      <Button
        class='method-btn add-btn'
        size='small'
        icon='md-add-circle'
        ghost
        v-if='methods.length < 4'
        @click='addMethod'
        type='text' />
      <i style='flex: 1;' />
      <span class='api-date'>{{api.crDate}}</span>
    </p>
    <Button
      v-if='methods.length === 0'
      class='del-btn'
      size='small'
      icon='md-trash'
      shape='circle'
      type='text' />
    <input
      type='text'
      style='position: absolute; opacity:0;z-index: -1;'
      ref='copy-holder'
      :value='`${host.protocolName}://${host.host}${host.path}${api.url}`'>

    <Modal
      class='api-modal'
      v-model='apiModal'
      title='修改api'
      @on-ok='submitApi'
      @on-cancel='cancel'>
      <Form
        ref='apiForm'
        :label-width='80'
        :model='apiFeild'
        :rules='apiRule'>
        <FormItem prop='name' label='名称:'>
          <Input
            v-model='apiFeild.name'
            placeholder='请输入名称'
            clearable>
          </Input>
        </FormItem>
        <FormItem prop='url' label='url:'>
          <Input
            v-model='apiFeild.url'
            placeholder='请输入url'
            clearable>
          </Input>
        </FormItem>
      </Form>
   </Modal>

  </div>
</template>

<script>
export default {
  name: 'ApiItem',
  props: {
    host: {
      type: Object,
      default: null,
    },
    api: {
      type: Object,
      default: null,
    },
    insertFrom: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      apiType: this.api.type || '',
      isLoading: false,
      apiModal: false,
      apiFeild: {
        name: '',
        url: '',
      },
      apiRule: {
        name: [{
          validator: (rule, value, callback) => { // eslint-disable-line
            if (value === '') {
              callback(new Error('名称不能为空！'))
            } else {
              callback()
            }
          },
          trigger: 'blur',
        }],
        url: [{
           validator: (rule, value, callback) => { // eslint-disable-line
            if (value === '') {
              callback()
            } else {
              if (/^\/[\S]*$/.test(value)) {
                callback()
              } else {
                callback(new Error('格式错误，例: [/info/app]'))
              }
            }
          },
          trigger: 'blur',
        }],
      },
    }
  },
  computed: {
    typeDict() {
      return this.$store.getters['common/dict']('mockType') || { options: [] }
    },
    methods() {
      const { methods } = this.api
      return methods ? methods.list : []
    },
    paramsTypeDict() {
      return this.$store.getters['common/dict']('paramsType') || { options: [] }
    },
    paramsTypeMap() {
      const map = {}
      const { options } = this.paramsTypeDict
      options.forEach(opt => {
        map[opt.id] = opt
      })
      return map
    },
  },
  watch: {
    api: function (val) {
      this.apiType = val.type
    },
    apiModal: function (val) {
      if (val) {
        this.apiFeild = {
          name: this.api.name,
          url: this.api.url,
        }
      }
    },
  },
  mounted() {
    this.$store.dispatch('common/getDict', { name: 'mockType' })
  },
  methods: {
    async submitApi() {
      const entry = { ...this.apiFeild }
      const success = await this.updateApi(entry)
      if (success) {
        this.cancel()
      }
    },
    cancel() {
      this.apiModal = false
    },
    copyUrl() {
      const holder = this.$refs['copy-holder']
      holder.select()
      document.execCommand('Copy')
      this.$Message.success('已复制链接')
    },
    async addMethod() {
      this.insertFrom && this.insertFrom.show()
      await this.insertFrom.initHost(this.host.id)
      await this.insertFrom.initApi(this.api)
    },
    showMethod(m) {
      this.$store.commit('mock/showCurrentMethod', m)
    },
    async updateApi(entry) {
      setTimeout(async () => {
        this.isLoading = true
        try {
          const { updateApi } = await this.$store.dispatch('mock/updateApi', {
            id: this.api.id,
            ...entry,
          })

          if (updateApi) {
            this.$emit('update')
          }
          return updateApi
        } finally {
          this.isLoading = false
        }
      }, 0)
    },
  },
}
</script>

<style lang="scss" scoped>
.api-item{
  position: relative;
  width: 100%;
  height: 80px;
  border-radius: 4px;
  border: 1px solid #2d8cf0;
  padding: 6px 16px;
  transition: all .3s ease;
  user-select: none;
  .api-name{
    height: 30px;
    line-height: 30px;
    font-size: 16px;
    font-weight: 500;

    .radio{
      margin-left: 20px;
      & /deep/ label{
        background-color: transparent;
        border-color: #2d8cf0;
        color: #2d8cf0;
      }
      & /deep/ .ivu-radio-wrapper-checked{
        background-color: #2d8cf0;
        color: #fff;
      }
    }
    .url{
      margin-left: 20px;
      color: #515a6e;
      font-size: 14px;
      font-style: italic;
      text-decoration: underline;
      cursor: pointer;
    }
    .api-date{
      float: right;
      font-size: 12px;
      color: #515a6e;
    }
  }

  .method-box{
    height: 40px;
    line-height: 40px;
    display: flex;
    align-items: center;
    .des{
      color: #17233d;
      font-size: 14px;
      font-weight: 500;
      margin-right: 5px;
    }
    .btn-pop{
      height: 30px;
      line-height: 30px;
      & /deep/ .ivu-poptip-rel{
        height: 30px;
      }
    }
    .method-btn{
      padding: 0 7px 2px;
      font-weight: 500;
      font-size: 16px;
      box-shadow: none;
      color: #2d8cf0;
      text-shadow: 0px 0px 0px #2d8cf0;
      transition: all .1s ease;
      &:focus{
        text-shadow: 0px 0px 3px #2d8cf0;
      }
      &:hover{
        text-shadow: 0px 0px 3px #2d8cf0;
      }
    }
    .add-btn{
      color: #808695;
      text-shadow: none;
      &:focus{
        text-shadow: none;
      }
      &:hover{
        text-shadow: none;
        color: #2d8cf0;
      }
    }
  }
  .del-btn{
    position: absolute;
    right: 3px;
    top: -10px;
    font-size: 14px;
    color: #fff;
    background: #ed4014;
  }
}
</style>

