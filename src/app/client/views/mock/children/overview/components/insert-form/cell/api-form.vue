<template>
  <div class='cell api-form'>
    <p class='form-title'>Api</p>
    <Form
      ref='apiForm'
      :model='apiFeild'
      :rules='apiRule'
      :label-width='80'>
      <FormItem label='API名称' prop='name'>
        <Row>
          <Col span='6'>
            <Input
              type='text'
              :clearable='!disabled'
              placeholder='请输入名称'
              :disabled='disabled'
              @input='$emit("update", apiFeild)'
              v-model='apiFeild.name'>
            </Input>
          </Col>
          <Col span='4' style='text-align: center;'> Cover By </Col>
          <Col span='14'>
            <Select
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
                  <span class='name'>{{a.name}}</span>
                  <span class='url'>{{a.url}}</span>
                  <p class='method-wrapper'>
                    <span v-for='m in a.methods' :key='m.id' :class='`method ${m.methodName}`'>
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
              @input='$emit("update", apiFeild)'
              v-model='apiFeild.url'>
              <span class='host-url' slot='prepend'>{{protocolDict[host.protocol] || "http"}}://{{host.host || "[host]"}}{{host.path || "/[path]"}}</span>
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
              @input='$emit("update", apiFeild)'
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
  props: {
    apis: {
      type: Array,
      default: () => ([]),
    },
    host: {
      type: Object,
      default: null,
    },
  },
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
    coverId: function (val) {
      if (val || val === 0) {
        const index = _.findIndex(this.apis, { id: parseInt(val) })
        if (index > -1) {
          this.initData(this.apis[index])
        } else {
          this.initData(null)
        }
      } else {
        this.initData(null)
      }
    },
    host: function () {
      this.coverId = ''
    },
  },
  mounted() {
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
    onCoverDateChange() {
      setTimeout(() => {
        this.$emit('update', this.apiFeild)
      }, 0)
    },
    getData() {
      return new Promise((resolve, reject) => {
        this.$refs.apiForm.validate((success) => {
          if (success) {
            resolve({ ...this.apiFeild })
          } else {
            reject()
          }
        })
      })
    },
    setCoverId(id) {
      this.coverId = id
      return new Promise((resolve) => setTimeout(() => {
        resolve()
      }, 100))
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
}
</style>

