<template>
  <div class='cell host-form'>
    <p class='form-title'>Host</p>
    <Form
      ref='hostForm'
      :model='hostFeild'
      :rules='hostRule'
      :label-width='80'>
      <FormItem label='名称' prop='name'>
        <Row>
          <Col span='6'>
            <Input
              type='text'
              :clearable='!disabled'
              placeholder='请输入名称'
              :disabled='disabled'
              @input='$emit("update", hostFeild)'
              v-model='hostFeild.name'>
            </Input>
          </Col>
          <Col span='4' style='text-align: center;'> Cover By </Col>
          <Col span='14'>
            <Select
              v-model='coverData'
              placeholder='从已存在的数据中选取覆盖'
              filterable
              @on-change='onCoverDateChange'
              clearable>
              <Option
                v-for='h in hosts'
                :value='h.id'
                :label='h.name'
                :key='h.id'>
                <span>{{h.name}}</span>
                <span style='float:right;color:#ccc'>{{h.host}}</span>
              </Option>
            </Select>
          </Col>
        </Row>

      </FormItem>
      <Row>
        <Col span='16'>
          <FormItem label='域名' prop='host'>
            <Input
              :clearable='!disabled'
              type='text'
              :disabled='disabled'
              placeholder='请输入域名,例如：api.venus-mock.com'
              @input='$emit("update", hostFeild)'
              v-model='hostFeild.host'></Input>
          </FormItem>
        </Col>
         <Col span='8'>
          <FormItem label='端口号' prop='port'>
            <Input
              :disabled='disabled'
              placeholder='请输入端口号,默认为80'
              type='text'
              :clearable='!disabled'
              @input='$emit("update", hostFeild)'
              v-model='hostFeild.port'></Input>
          </FormItem>
        </Col>
        <Col span='16'>
          <FormItem label='路径' prop='path'>
            <Input
              :disabled='disabled'
              placeholder='请输入路径,例如：/h5/v1'
              type='text'
              :clearable='!disabled'
              @input='$emit("update", hostFeild)'
              v-model='hostFeild.path'></Input>
          </FormItem>
        </Col>
        <Col span='8'>
          <FormItem label='协议' prop='protocol'>
            <RadioGroup
              v-model='hostFeild.protocol'
              @input='$emit("update", hostFeild)'
              type='button'>
              <Radio
                v-for='opt in protocolDict ? protocolDict.options : []'
                :key='opt.id'
                :disabled='disabled'
                :value='opt.id'
                :label='opt.id'>{{opt.name.toUpperCase()}}</Radio>
            </RadioGroup>
          </FormItem>
        </Col>
      </Row>
    </Form>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  name: 'HostForm',
  props: {
    hosts: {
      type: Array,
      default: () => ([]),
    },
  },
  data() {
    return {
      hostFeild: {
        id: '',
        name: '',
        host: '',
        port: 80,
        path: '',
        protocol: 1,
        online: 1,
      },
      hostRule: {
        name: [
          { validator: (rule, value, callback) => { // eslint-disable-line
            if (value === '') {
              callback(new Error('名称不能为空！'))
            } else {
              callback()
            }
          },
          trigger: 'change',
          },
        ],
        host: [
          { validator: (rule, value, callback) => { // eslint-disable-line
            if (value === '') {
              callback(new Error('域名不能为空！'))
            } else {
              callback()
            }
          },
          trigger: 'change',
          },
        ],
        port: [
          { validator: (rule, value, callback) => { // eslint-disable-line
            if (value === '') {
              callback(new Error('端口号不能为空！'))
            } else {
              callback()
            }
          },
          trigger: 'change',
          },
        ],
        path: [
          { validator: (rule, value, callback) => { // eslint-disable-line
            if (value === '') {
              callback()
            } else {
              if (/^\/[\S]*$/.test(value)) {
                callback()
              } else {
                callback(new Error('公共路径格式错误，例: [/info/app]'))
              }
            }
          },
          trigger: 'change',
          },
        ],
      },
      coverData: null,
    }
  },
  computed: {
    disabled() {
      return !!this.coverData
    },
    protocolDict() {
      return this.$store.getters['common/dict']('protocol')
    },
  },
  watch: {
    coverData: function (val) {
      if (val || val === 0) {
        const index = _.findIndex(this.hosts, { id: parseInt(val) })
        if (index > -1) {
          this.$refs.hostForm.resetFields()
          this.initData(this.hosts[index])
        } else {
          this.initData(null)
        }
      } else {
        this.initData(null)
      }
    },
  },
  mounted() {
  },
  methods: {
    initData(data) {
      if (data) {
        this.hostFeild = { ...data, protocol: parseInt(data.protocol) }
        this.$emit('cover', data.id)
      } else {
        this.hostFeild = {
          id: '',
          name: '',
          host: '',
          path: '',
          protocol: 1,
          online: 1,
        }
        this.$emit('cover', '')
      }
    },
    onCoverDateChange() {
      setTimeout(() => {
        this.$emit('update', this.hostFeild)
      }, 0)
    },
    getData() {
      return new Promise((resolve, reject) => {
        this.$refs.hostForm.validate((success) => {
          if (success) {
            resolve(this.hostFeild)
          } else {
            reject()
          }
        })
      })
    },
    setCoverId(id) {
      this.coverData = id
      return new Promise((resolve) => setTimeout(() => {
        this.$emit('update', this.hostFeild)
        resolve()
      }, 0))
    },
  },
}
</script>

<style lang="scss">
.host-form{
  border-bottom: 1px solid #dcdee2;
  padding-bottom: 16px;
  .form-title{
    font-size: 16px;
    font-weight: 500;
  }
}
</style>


