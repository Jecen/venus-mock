<template>
  <div class='cell host-form'>
    <p class='form-title'>Host</p>
    <Form
      ref='formCustom'
      :model='hostFeild'
      :rules='hostRule'
      :label-width='80'>
      <FormItem label='名称' prop='name'>
        <Row>
          <Col span='6'>
            <Input
              type='text'
              clearable
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
        <Col span='8'>
          <FormItem label='域名' prop='host'>
            <Input
              type='text'
              :disabled='disabled'
              placeholder='请输入域名'
              @input='$emit("update", hostFeild)'
              v-model='hostFeild.host'></Input>
          </FormItem>
        </Col>
        <Col span='8'>
          <FormItem label='路径' prop='path'>
            <Input
              :disabled='disabled'
              placeholder='请输入路径'
              type='text'
              @input='$emit("update", hostFeild)'
              v-model='hostFeild.path'></Input>
          </FormItem>
        </Col>
        <Col span='8'>
          <FormItem label='协议' prop='protocol'>
            <RadioGroup
              :disabled='disabled'
              v-model='hostFeild.protocol'
              @input='$emit("update", hostFeild)'
              type='button'>
              <Radio
                v-for='opt in protocolDict ? protocolDict.options : []'
                :key='opt.id'
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
          trigger: 'blur',
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
          trigger: 'blur',
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
          trigger: 'blur',
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


