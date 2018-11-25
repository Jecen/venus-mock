<template>
  <div class='cell api-form'>
    <p class='form-title'>Api</p>
    <Form
      ref='apiForm'
      :model='apiFeild'
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
              v-model='apiFeild.name'>
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
              :clearable='!disabled'
              v-model='apiFeild.url'>
              <span class='host-url' slot='prepend'>
                {{protocolDict[host.protocol] || "http"}}://{{host.host || "[host]"}}{{host.port !== 80 ? `:${host.port}` : ''}}{{host.path || "/[path]"}}
              </span>
            </Input>
          </FormItem>
        </Col>
        <Col span='6' class='switch-form-itm'>
          <FormItem label='isMock' prop='type'>
            <i-switch
              class='type-switch'
              v-model='apiFeild.type'
              size='large'
              :disabled='disabled'
              :true-value='7'
              :false-value='8'>
              <span slot='open'>MOCK</span>
              <span slot='close'>PASS</span>
            </i-switch>
          </FormItem>
        </Col>
      </Row>
    </Form>
    {{!!coverId}}{{coverId}}
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  name: 'ApiForm',
  data() {
    return {
      apiFeild: {
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
    host() {
      return this.$store.getters['mock/hostField']
    },
    apis() {
      const { apis: { list } = { list: [] }} = this.host
      return list
    },
    disabled() {
      return this.coverId !== ''
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
    host: function (val) {
      const { apis: { list } = { list: [] }} = val
      const index = _.findIndex(list, { id: `${this.coverId}` })
      this.coverId = index > -1 ? this.coverId : ''
    },
  },
  methods: {
    initData(data) {
      if (data) {
        this.apiFeild = { ...data }
      } else {
        this.apiFeild = {
          name: '',
          url: '',
          type: 7,
        }
      }
    },
    onCoverDateChange(id) {
      this.coverId = id
      const [api] = this.apis.filter(a => `${a.id}` === `${id}`)
      this.$refs.apiForm.resetFields()
      this.initData(api || null)
      this.$store.commit('mock/updateApiField', this.apiFeild)
    },
    getData() {
      return new Promise((resolve, reject) => {
        this.$refs.apiForm.validate((success) => {
          if (success) {
            const rst = Object.assign({}, this.apiFeild)
            delete rst['methods']
            resolve(rst)
          } else {
            reject()
          }
        })
      })
    },
    setCoverId(id) {
      this.coverId = id
      const [api] = this.apis.filter(a => a.id === id)
      this.$refs.apiForm.resetFields()
      this.initData(api || null)
      this.$store.commit('mock/updateApiField', this.apiFeild)
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

