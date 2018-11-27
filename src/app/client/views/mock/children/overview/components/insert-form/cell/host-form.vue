<template>
  <div class='cell host-form'>
    <p class='form-title'>Host</p>
    <Form
      ref='hostForm'
      :model='hostField'
      :rules='hostRule'
      :label-width='80'>
      <FormItem label='名称' prop='name' class='cover-itm'>
        <Row>
          <Col span='6'>
            <Input
              type='text'
              :clearable='!disabled'
              placeholder='请输入名称'
              :disabled='disabled'
              @input='update'
              v-model='hostField.name'>
            </Input>
          </Col>
          <Col span='4' style='text-align: center;'> Cover By </Col>
          <Col span='14'>
            <Select
              class='cover-pool'
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
              @input='update'
              placeholder='请输入域名,例如：api.venus-mock.com'
              v-model='hostField.host'></Input>
          </FormItem>
        </Col>
         <Col span='8'>
          <FormItem label='端口号' prop='port'>
            <Input
              :disabled='disabled'
              placeholder='请输入端口号,默认为80'
              type='text'
              :clearable='!disabled'
              v-model='hostField.port'></Input>
          </FormItem>
        </Col>
        <Col span='16'>
          <FormItem label='路径' prop='path'>
            <Input
              :disabled='disabled'
              placeholder='请输入路径,例如：/h5/v1'
              type='text'
              @input='update'
              :clearable='!disabled'
              v-model='hostField.path'></Input>
          </FormItem>
        </Col>
        <Col span='8'>
          <FormItem label='协议' prop='protocol'>
            <RadioGroup
              v-model='hostField.protocol'
              @input='update'
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
export default {
  name: 'HostForm',
  data() {
    return {
      hostField: {
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
    hosts() {
      return this.$store.getters['mock/hosts']
    },
    host() {
      return this.$store.getters['mock/hostField']
    },
  },
  watch: {
    host: function (val) {
      if (!this.disabled) {
        this.coverData = val.id
        this.hostField = val
      }
    },
  },
  mounted() {
  },
  methods: {
    update() {
      setTimeout(() => this.$store.commit('mock/updateHostField', this.hostField), 0)
    },
    initData(data) {
      if (data) {
        this.hostField = { ...data, protocol: parseInt(data.protocol) }
        this.coverData = data.id
      } else {
        this.hostField = {
          id: '',
          name: '',
          host: '',
          port: 80,
          path: '',
          protocol: 1,
          online: 1,
        }
        this.coverData = ''
      }
    },
    onCoverDateChange(id) {
      const [host] = this.hosts.filter(h => h.id === id)
      this.$refs.hostForm.resetFields()
      this.initData(host || null)
      this.$store.commit('mock/updateHostField', this.hostField)
    },
    clear() {
      this.$refs.hostForm.resetFields()
      this.initData(null)
      this.$store.commit('mock/updateHostField', null)
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


