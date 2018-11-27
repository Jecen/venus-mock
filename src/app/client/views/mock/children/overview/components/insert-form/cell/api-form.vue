<template>
  <div class='cell api-form'>
    <p class='form-title'>Api</p>
    <Form
      ref='apiForm'
      :model='apiField'
      :rules='apiRule'
      :label-width='80'>
      <FormItem label='API名称' prop='name' class='cover-itm'>
        <Row>
          <Col span='6'>
            <Input
              type='text'
              :clearable='!disabled'
              placeholder='请输入名称'
              :disabled='disabled'
              @input='update'
              v-model='apiField.name'>
            </Input>
          </Col>
          <Col span='4' style='text-align: center;'> Cover By </Col>
          <Col span='14'>
            <Select
              class='cover-pool'
              v-model='coverId'
              placeholder='从已存在的数据中选取覆盖'
              filterable
              @on-change='onCoverDateChange'
              clearable>
              <Option
                v-for='a in apis'
                :value='a.id'
                :label='a.name'
                :key='a.id'>
                <div class='option-inner-wrapper'>
                  <span class='name'>{{a.name}}{{a.id}}</span>
                  <span class='url'>{{a.url}}</span>
                  <p class='method-wrapper'>
                    <span v-for='m in a.methods ? a.methods.list : []' :key='m.id' :class='`method ${m.methodName}`'>
                      {{m.methodName.toUpperCase()}}
                    </span>
                  </p>
                </div>
              </Option>
            </Select>
          </Col>
        </Row>

      </FormItem>
      <Row>
        <Col span='18'>
          <FormItem label='URL' prop='url'>
            <Input
              :disabled='disabled'
              placeholder='请输入路径'
              type='text'
              @input='update'
              :clearable='!disabled'
              v-model='apiField.url'>
              <span class='host-url' slot='prepend'>
                {{protocolDict[hostField.protocol] || "http"}}://{{hostField.host || "[host]"}}{{hostField.port !== 80 ? `:${hostField.port}` : ''}}{{hostField.path || "/[path]"}}
              </span>
            </Input>
          </FormItem>
        </Col>
        <Col span='6' class='switch-form-itm'>
          <FormItem label='isMock' prop='type'>
            <i-switch
              class='type-switch'
              v-model='apiField.type'
              size='large'
              :disabled='disabled'
              @input='update'
              :true-value='7'
              :false-value='8'>
              <span slot='open'>MOCK</span>
              <span slot='close'>PASS</span>
            </i-switch>
          </FormItem>
        </Col>
      </Row>
    </Form>
  </div>
</template>

<script>
export default {
  name: 'ApiForm',
  data() {
    return {
      apiField: {
        name: '',
        url: '',
        type: 7,
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
      coverId: '',
    }
  },
  computed: {
    api() {
      return this.$store.getters['mock/apiField']
    },
    hostField() {
      return this.$store.getters['mock/hostField']
    },
    apis() {
      return this.$store.getters['mock/apis']
    },
    disabled() {
      return !!this.coverId
    },
    protocolDict() {
      const { options } = this.$store.getters['common/dict']('protocol') || { options: [] }
      const dictMap = {}
      options.forEach(opt => {
        dictMap[opt.id] = opt.name
      })
      return dictMap
    },
  },
  watch: {
    apis: function () {
      this.coverId = ''
    },
    api: function (api) {
      if (!this.disabled) {
        this.coverId = api.id
        this.apiField = api
      }
    },
  },
  methods: {
    update() {
      setTimeout(() => {
        this.$store.commit('mock/updateApiField', this.apiField)
      }, 0)
    },
    initData(data) {
      if (data) {
        this.apiField = { ...data }
        this.coverId = data.id
      } else {
        this.apiField = {
          name: '',
          url: '',
          type: 7,
        }
        this.coverId = ''
      }
    },
    onCoverDateChange(id) {
      this.coverId = id
      const [api] = this.apis.filter(a => `${a.id}` === `${id}`)
      this.$refs.apiForm.resetFields()
      this.initData(api || null)
      this.$store.commit('mock/updateApiField', this.apiField)
    },
    clear() {
      this.$refs.apiForm.resetFields()
      this.initData(null)
      this.$store.commit('mock/updateApiField', null)
    },
  },
}
</script>

<style lang="scss" scoped>
.api-form{
  padding-top: 16px;
  border-bottom: 1px dashed #e5e6e6;
  .form-title{
    font-size: 16px;
    font-weight: 500;
  }
  .host-url{
    font-style: italic;
    font-size: 14px;
    font-weight: 500;
  }
  .switch-form-itm{
    .type-switch{
      width: 65px;
    }
    & /deep/ .ivu-switch-large.ivu-switch-checked:after{
      left: 44px;
    }
  }
  .option-inner-wrapper{
    display: flex;
    .name{
      flex: 2;
    }
    .url{
      flex: 1;
      color:#ccc;
    }
    .method-wrapper{
      flex: 1.5;
      text-align: right;
      .method{
        margin-left: 5px;
      }
      .get{
        color: #5cadff;
      }
      .post{
        color: #2f54eb;
      }
      .put{
        color: #08979c;
      }
      .delete{
        color: #d46b08;
      }
    }
  }
  .cover-itm{
    .cover-pool{
      & /deep/ .ivu-select-selection{
        border: 1px solid #dcdee2;
      }
      & /deep/ .ivu-icon{
        color: #808695;
      }
    }
    & /deep/ .ivu-select-visible{
      & /deep/ .ivu-select-selection{
        box-shadow: 0 0 0 2px rgba(45,140,240,.2);
      }
    }
  }
}
</style>

