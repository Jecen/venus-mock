<template>
  <div class='page project-page'>
    <Row :gutter='16'>
      <Col
        style='margin-bottom: 16px;'
        v-for='p in list'
        :key='p.id'
        :sm='24'
        :md='12'
        :lg='12'>
        <project
          class='project'
          :info='p'
          @edit='edit(p)'
          @del='del(p)' />
      </Col>
    </Row>
    <Button
      class='add-btn'
      type='primary'
      shape='circle'
      @click='drawerVisible = true'
      icon='md-add'>
      新增
    </Button>
    <Drawer
      class='create-draw'
      :title='projectFeild.id ? "修改项目" : "创建项目"'
      v-model='drawerVisible'
      width='360'
      :mask-closable='false'>
      <project-form ref='projectForm' @finish='onEditeFinbish' />
    </Drawer>
  </div>
</template>

<script>
import ProjectItem from './components/project-item'
import ProjectForm from './components/project-from'
export default {
  name: 'Project',
  components: {
    project: ProjectItem,
    'project-form': ProjectForm,
  },
  data() {
    return {
      listenerId: '',
      projectFeild: {
        id: '',
        name: '',
        description: '',
        img: '',
      },
      drawerVisible: false,
      rule: {
        name: [
          { required: true, message: '项目名称为必填', trigger: 'blur' },
        ],
        description: [
          { required: true, message: '项目描述为必填', trigger: 'blur' },
        ],
      },
    }
  },
  computed: {
    list() {
      return this.$store.getters['mock/projects']
    },
  },
  mounted() {
    this.fetchList()
    this.listenerId = this.$mockSocket.registerListener('mock', () => this.fetchList())
  },
  beforeDestroy() {
    this.$mockSocket.unRegisterListener(this.listenerId)
  },
  methods: {
    fetchList() {
      this.$store.dispatch('mock/getProjects')
    },
    onEditeFinbish(needUpdate) {
      this.drawerVisible = false
      needUpdate && this.fetchList()
    },
    edit(p) {
      this.$refs.projectForm.setFeild(p)
      this.drawerVisible = true
    },
    del(p) {
      this.$store.dispatch('mock/deleteProject', { id: p.id })
        .then(() => {
          this.fetchList()
        })
    },
  },
}
</script>

<style lang="scss" scoped>
.project-page{
  height: 100%;
  .add-btn{
    position: fixed;
    right: 50px;
    bottom: 70px;
  }

}
.create-draw{
  & /deep/ .ivu-drawer-body{
    padding: 0;
  }
}
</style>

