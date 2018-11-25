<template>
  <div class='page host-page'>
    <project-info :info='project' />
    <Row class='content'>
      <Col
        class='content-col'
        :xs='24'
        :sm='24'
        :md='18'
        :lg='16'>
        <host-box
          v-for='h in hosts'
          :key='h.id'
          :host='h'
          :insertFrom='$refs["insertFrom"]'
          @testApi='time => {currentTimeStamp = time; testBoard = true}'
          @edit='editHost(h)'
          @del='delHost(h)'
          @update='getData()' />
      </Col>
      <Col
        class='content-col'
        :xs='0'
        :sm='0'
        :md='6'
        :lg='8'>
        Method
      </Col>
    </Row>

    <Button
      class='add-host'
      type='primary'
      shape='circle'
      @click='drawerVisible = true'
      icon='md-add'>
      新增
    </Button>
    <insert-form
      ref='insertFrom'
      :projectId='$route.params.projectId'
      v-model='drawerVisible' />
    <Modal
      class='host-modal'
      v-model='hostModal'
      title='修改api分类'
      @on-ok='submitHost'
      @on-cancel='cancel'>
      <Form
        ref='hostForm'
        :label-width='80'
        :model='hostFeild'
        :rules='hostRule'>
        <FormItem prop='name' label='分类名称:'>
          <Input
            v-model='hostFeild.name'
            placeholder='请输入分类名称'
            clearable>
          </Input>
        </FormItem>
        <FormItem prop='fullPath' label='公共路径:'>
          <Input v-model='hostFeild.fullPath'>
            <Select v-model='hostFeild.protocol' slot='prepend' style='width: 80px'>
              <Option v-for='opt in protocolDict.options' :key='opt.id' :value='opt.id'>{{opt.name}}://</Option>
            </Select>
          </Input>
        </FormItem>
      </Form>
   </Modal>

   <Drawer
      :width='800'
      class='test-drawer'
      :closable='false'
      v-model='testBoard'>
      <div class='msg-content'>
        <p class='test-msg' v-for='m in testMsgArr' :key='m'>
          <span class='name'>{{currentHostName}}批量测试 </span>
          <span class='time'>[{{m.time}}]:</span>
          <span class='msg'>{{m.msg}}</span>
        </p>
      </div>
    </Drawer>
  </div>
</template>

<script>
import insertForm from './components/insert-form'
import projectInfo from './components/project-info'
import hostBox from './components/host-box'
export default {
  name: 'Host',
  components: {
    'project-info': projectInfo,
    'host-box': hostBox,
    'insert-form': insertForm,
  },
  data() {
    return {
      hostColumn: [
        {
          type: 'index',
          width: 60,
        },
        {
          title: '名称',
          key: 'name',
          align: 'center',
        },
        {
          title: '域名',
          key: 'host',
          align: 'center',
        },
        {
          title: '公有路径',
          key: 'path',
          align: 'center',
        },
        {
          title: '协议',
          key: 'protocolName',
          align: 'center',
          width: 70,
        },
        {
          title: '状态',
          render: (h, { row: { online }}) => h('span', online === 1 ? '生效' : '失效'),
          align: 'center',
          width: 70,
        },
      ],
      apiMap: {},
      hostModal: false,
      hostFeild: {
        id: '',
        name: '',
        host: '',
        path: '',
        protocol: 1,
        fullPath: '',
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
        fullPath: [
          {
            validator: (rule, value, callback) => { // eslint-disable-line
              if (value === '') {
                callback(new Error('共有路径不能为空！'))
              } else if (this.hostFeild.protocol === '') {
                callback(new Error('请选择请求策略！'))
              } else {
                callback()
              }
            },
            trigger: 'blur',
          },
        ],
      },
      drawerVisible: false,
      currentTimeStamp: '',
      currentHostName: '',
      testMsgArr: [],
      testBoard: false,
    }
  },
  computed: {
    protocolDict() {
      return this.$store.getters['common/dict']('protocol') || { options: [] }
    },
    overview() {
      return this.$store.getters['mock/overview']
    },
    project() {
      const { project } = this.overview
      return project
    },
    hosts() {
      const { hosts: { list } = { list: [] }} = this.project || {}
      return list
    },
  },
  created() {
    this.getData()
    this.$store.dispatch('common/getDict', { name: 'mockType' })
    this.$store.dispatch('common/getDict', { name: 'protocol' })
    this.$store.dispatch('common/getDict', { name: 'paramsType' })

    this.$mockSocket.registerListener('testStep', (data) => {
      const obj = JSON.parse(data)
      this.handler(obj)
      console.log(obj, '!!!')
    })
  },
  methods: {
    async getData() {
      const { projectId: id } = this.$route.params
      const { project, host: hosts } = await this.$store.dispatch('mock/getOverViewDate', { id })
      this.project = project
      this.hosts = hosts
    },
    async fetchApis(h, v) {
      if (v) {
        const apis = await this.$store.dispatch('mock/getHostOverviewData', { id: h.id })
        this.apiMap = {
          ...this.apiMap,
          [h.id]: apis,
        }
      }
    },
    editHost(host) {
      this.hostModal = true
      this.hostFeild = {
        ...host,
        protocol: parseInt(host.protocol),
        fullPath: `${host.host}${host.path}`,
      }
    },
    async delHost({ id }) {
      await this.$store.dispatch('mock/delHost', { id })
      this.getData()
    },
    submitHost() {
      const { id, name, fullPath, protocol } = this.hostFeild
      const [host, ...pathArr] = fullPath.split('/')
      const params = {}
      params['id'] = id
      params['name'] = name
      params['host'] = host
      params['path'] = `/${pathArr.join('/')}`
      params['protocol'] = protocol
      this.$store.dispatch('mock/updateHost', params)
        .then(() => {
          this.getData()
          this.cancel()
        })
    },
    cancel() {
      this.hostModal = false
      this.hostFeild = {
        id: '',
        name: '',
        host: '',
        path: '',
        protocol: 1,
        fullPath: '',
      }
      this.$refs.hostForm.resetFields()
    },
    handler(payload) {
      const { data, timeStamp } = payload
      if (this.currentTimeStamp !== timeStamp) {
        return
      }
      const { type, count, hostName, url, method, rst } = data
      switch (type) {
        case 'start-test':
          this.testMsgArr = []
          this.currentHostName = hostName
          this.testMsgArr.push({
            time: this.tool.reTime(),
            msg: `开始进行${hostName}下API批量测试，共 ${count} 个`,
          })
          break
        case 'fetch-start':
          this.testMsgArr.push({
            time: this.tool.reTime(),
            msg: `请求 ${url} [${method.name}] 中...`,
          })
          break
        case 'fetch-success':
          this.testMsgArr.push({
            time: this.tool.reTime(),
            msg: `请求 ${url} [${method.name}] 成功！返回数据: ${JSON.stringify(rst)}`,
          })
          break
        case 'fetch-failure':
          this.testMsgArr.push({
            time: this.tool.reTime(),
            msg: `请求 ${url} [${method.name}] 失败！错误信息: ${JSON.stringify(rst)}`,
          })
          break
        default:
          break
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.host-page{
  height: 100%;
  background-color: #f5f7f9;
  .content{
    width: 100%;
    height: calc(100% - 200px);
    background-color: #fff;
    .content-col{
      height: 100%;
    }
  }
  .add-host{
    position: fixed;
    right: 50px;
    bottom: 90px;
  }
}
.host-modal{
  & /deep/ .ivu-form-item-label{
    font-size: 14px;
    font-weight: 500;
    width: 100px;
  }
}
.test-drawer{
  .msg-content{
    height: 100%;
    background: #000;
    border-radius: 3px;
    padding: 10px;
    .test-msg{
      font-size: 12px;
      color: green;
      font-weight: 500;
    }
  }
  & /deep/ .ivu-drawer-body{
    padding: 5px;
  }
}
</style>

