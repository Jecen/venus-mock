<template>
  <div class='cell method-form'>
    <p class='form-title'>
      Method
    </p>
    <Form
      ref='methodFrom'
      :model='methodFeild[currentMethod]'
      :rules='methodRule'
      :label-width='80'>
      <Row>
        <Col span='11'>
          <FormItem label='请求类型'>
            <RadioGroup class='radio' v-model='currentMethod' type='button'>
              <Radio
                class='m-btn'
                :style='`color: ${m.color};`'
                v-for='m in methodDict'
                :key='m.id'
                :label='m.key'>{{m.name}}</Radio>
            </RadioGroup>
          </FormItem>
        </Col>
        <Col span='13'>
          <FormItem label='名称' prop='name'>
            <Input
              type='text'
              :clearable='!disabled'
              placeholder='请输入名称'
              :disabled='disabled'
              v-model='methodFeild[currentMethod].name'>
            </Input>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span='24'>
          <FormItem label='参数' prop='params'>
            <div class='params-list'>
              <p class='params-itm' v-for='(p, index) in methodFeild[currentMethod].params' :key='p.id'>
                <span class='params-key'>
                  {{p.key}}
                </span>
                <span class='params-type'>
                  「<span class='type'>{{paramsTypeMap[p.type].name}}</span>」
                </span>
                <span class='params-name'>
                  ({{p.name}})
                </span>
                <span class='params-required' :style='{color: p.mandatory === 1 ? "#ed4014" : "#19be6b"}'>
                  {{p.mandatory === 1 ? "必填" : "非必填"}}
                </span>
                <span class='params-info'>{{p.info}}</span>
                <Button
                  class='itm-btn'
                  v-if='!disabled'
                  type='text'
                  @click='showParamsModal(p, index)'>Edit</Button>
                <Button
                  class='itm-btn'
                  v-if='!disabled'
                  type='text'
                  @click='delParam(index)'>Del</Button>
              </p>
              <p v-if='!disabled' style='padding: 0 16px;'>
                <Button type='primary' size='small' @click='showParamsModal()'>新增</Button>
              </p>
              <p v-else style='padding: 0 16px;'>
                暂无参数
              </p>
            </div>
          </FormItem>
        </Col>
        <Col span='24'>
          <FormItem label='返回数据' prop='result'>
            <Input
              :disabled='disabled'
              :clearable='!disabled'
              placeholder='请输入返回数据, 默认返回 null'
              type='textarea'
              v-model='methodFeild[currentMethod].result'></Input>
          </FormItem>
        </Col>
      </Row>
    </Form>
    <Modal
      v-model='paramsModal'
      title='编辑参数'
      @on-ok='submitParams'
      @on-cancel='dismiss'>
      <Form
        ref='paramsForm'
        :model='currentParams'
        :rules='paramsRule'
        :label-width='80'>
        <Row>
          <Col span='12'>
          <FormItem label='参数字段' prop='key'>
            <Input
              clearable
              placeholder='请输入字段名'
              type='text'
              v-model='currentParams.key'></Input>
          </FormItem>
          </Col>
          <Col span='12'>
          <FormItem label='参数名称' prop='name'>
            <Input
              clearable
              placeholder='请输入参数名称'
              type='text'
              v-model='currentParams.name'></Input>
          </FormItem>
          </Col>
          <Col span='12'>
            <FormItem label='参数类型' prop='type'>
              <Select
                v-model='currentParams.type'
                placeholder='请选择参数类型'
                clearable>
                <Option
                  v-for='t in typeDict.options'
                  :value='t.id'
                  :label='t.name'
                  :key='t.id'>
                  {{t.name}}
                </Option>
              </Select>
            </FormItem>
          </Col>
          <Col span='12'>
            <FormItem label='是否必填' prop='mandatory'>
              <i-switch v-model='currentParams.mandatory' :true-value='1' :false-value='0' />
            </FormItem>
          </Col>
          <Col span='24'>
            <FormItem label='描述信息' prop='info'>
              <Input
                clearable
                placeholder='请输入字段描述信息'
                type='textarea'
                v-model='currentParams.info'></Input>
            </FormItem>
          </Col>
        </Row>
      </Form>
    </Modal>
  </div>
</template>

<script>
export default {
  name: 'MethodFrom',
  props: {
    methods: {
      type: Array,
      default: () => ([]),
    },
  },
  data() {
    return {
      methodDict: [
        {
          name: 'GET',
          key: 'get',
          color: '#5cadff',
        },
        {
          name: 'POST',
          key: 'post',
          color: '#2f54eb',
        },
        {
          name: 'PUT',
          key: 'put',
          color: '#08979c',
        },
        {
          name: 'DELETE',
          key: 'delete',
          color: '#d46b08',
        },
      ],
      currentMethod: 'get',
      methodFeild: {
        get: {
          name: '',
          method: 3,
          result: '',
          params: [],
        },
        post: {
          name: '',
          method: 4,
          result: '',
          params: [],
        },
        put: {
          name: '',
          method: 5,
          result: '',
          params: [],
        },
        delete: {
          name: '',
          method: 6,
          result: '',
          params: [],
        },
      },
      methodRule: {
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
      },
      paramsModal: false,
      currentParams: {
        index: -1,
        key: '',
        name: '',
        type: '',
        info: '',
        mandatory: 1,
      },
      paramsRule: {
        key: {
          trigger: 'blur',
          validator: (rule, value, callback) => { // eslint-disable-line
            if (value === '') {
              callback(new Error('名称不能为空！'))
            } else if (!/^[a-z|A-Z]+$/.test(value)) {
              callback(new Error('字段名必须由英文字母组成！'))
            } else {
              callback()
            }
          },
        },
        name: {
          trigger: 'blur',
          validator: (rule, value, callback) => { // eslint-disable-line
            if (value === '') {
              callback(new Error('字段名称不能为空！'))
            } else {
              callback()
            }
          },
        },
        type: {
          trigger: 'blur',
          validator: (rule, value, callback) => { // eslint-disable-line
            if (value === '') {
              callback(new Error('字段类型不能为空！'))
            } else {
              callback()
            }
          },
        },
      },
    }
  },
  computed: {
    disabled() {
      return !!this.methodFeild[this.currentMethod].id
    },
    typeDict() {
      return this.$store.getters['common/dict']('paramsType') || { options: [] }
    },
    paramsTypeMap() {
      const map = {}
      const { options } = this.typeDict
      options.forEach(opt => {
        map[opt.id] = opt
      })
      return map
    },
  },
  watch: {
    methods: function (val) {
      const defaultMethods = {
        get: {
          name: '',
          method: 3,
          result: '',
          params: [],
        },
        post: {
          name: '',
          method: 4,
          result: '',
          params: [],
        },
        put: {
          name: '',
          method: 5,
          result: '',
          params: [],
        },
        delete: {
          name: '',
          method: 6,
          result: '',
          params: [],
        },
      }
      if (val.length > 0) {
        val.forEach(m => {
          const { methodName } = m
          this.methodFeild = {
            ...this.methodFeild,
            [methodName]: m,
          }
        })
      } else {
        this.methodFeild = defaultMethods
      }
      this.$emit('methodChange', this.methodFeild[this.currentMethod])
    },
    currentMethod: function (m) {
      this.$emit('methodChange', this.methodFeild[m])
    },
  },
  methods: {
    showParamsModal(params, index) {
      this.currentParams = {
        ...(params ? { ...params, index } : {
          index: -1,
          key: '',
          name: '',
          type: '',
          info: '',
          mandatory: 1,
        }),
      }
      this.paramsModal = true
    },
    submitParams() {
      this.$refs['paramsForm'].validate((success) => {
        if (success) {
          const { index } = this.currentParams
          if (index > -1) {
            const params = [...this.methodFeild[this.currentMethod].params]
            params[index] = Object.assign({}, this.currentParams)
            this.methodFeild = {
              ...this.methodFeild,
              [this.currentMethod]: {
                ...this.methodFeild[this.currentMethod],
                params,
              },
            }
          } else {
            this.methodFeild = {
              ...this.methodFeild,
              [this.currentMethod]: {
                ...this.methodFeild[this.currentMethod],
                params: [Object.assign({}, this.currentParams)],
              },
            }
            console.log(this.methodFeild)
          }
        }
      })
    },
    dismiss() {
      this.currentParams = {
        index: -1,
        key: '',
        name: '',
        type: '',
        info: '',
        mandatory: 1,
      }
      this.paramsModal = false
    },
    delParam(index) {
      const params = [...this.methodFeild[this.currentMethod].params]
      params.splice(index, 1)
      this.methodFeild = {
        ...this.methodFeild,
        [this.currentMethod]: {
          ...this.methodFeild[this.currentMethod],
          params,
        },
      }
    },
    getData() {
      return new Promise((resolve, reject) => {
        this.$refs.methodFrom.validate((success) => {
          if (success) {
            resolve({ ...this.methodFeild })
          } else {
            reject()
          }
        })
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.method-form{
   padding-top: 16px;
  .form-title{
    font-size: 16px;
    font-weight: 500;
    .radio{
      margin-left: 16px;
      .m-btn{
        font-weight: 500;
      }
    }
  }
  .params-list{
    border: 1px dashed #e5e6e7;
    border-radius: 4px;
    .params-itm{
      border-bottom: 1px dashed #e5e6e7;
      display: flex;
      align-items: center;
      .params-key{
        color: #17233d;
        font-weight: 500;
        display: inline-block;
        width: 100px;
        padding-left: 16px;
        text-align: left;
        font-size: 14px;
      }
      .params-type{
        color: #17233d;
        font-weight: 500;
        display: inline-block;
        width: 90px;
        text-align: left;
        .type{
          font-style: italic;
          font-weight: 600;
          color: #faad14;
        }
      }
      .params-name{
        color: #515a6e;
        font-weight: 500;
        display: inline-block;
        width: 150px;
        text-align: left;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
      }
      .params-required{
        display: inline-block;
        width: 60px;
        text-align: left;
      }
      .params-info{
        color: #808695;
        font-weight: 500;
        display: inline-block;
        text-align: left;
        flex: 1;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
      }
      .itm-btn{
        padding: 0 ;
        margin-right: 16px;
      }
    }
  }
}
</style>

