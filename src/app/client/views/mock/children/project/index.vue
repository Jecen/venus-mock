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
        <project class='project' :info='p' @edit='edit(p)' />
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
      <div class='content'>
        <Form
          ref='form'
          class='form'
          :model='projectFeild'
          :rules='rule'
          :label-width='80'
          label-position='left'>
          <FormItem label='项目名' prop='name'>
            <Input v-model='projectFeild.name' placeholder='请输入项目名称'></Input>
          </FormItem>
          <FormItem label='项目描述' prop='description'>
            <Input v-model='projectFeild.description' type='textarea' placeholder='请输入项目描述'></Input>
          </FormItem>
          <FormItem label='项目logo'>
            <Upload
              multiple
              type='drag'
              :before-upload='uploadImg'
              action=''>
              <div style='padding: 20px 0' v-if='!projectFeild.img'>
                <Icon type='ios-cloud-upload' size='52' style='color: #3399ff' />
                <p>通过点击或拖拽上传图片{{projectFeild.img}}</p>
              </div>
              <div class='img-wrapper' v-else>
                <img :src='$isDev ? `//localhost:9000${projectFeild.img}` : projectFeild.img' alt='img'>
              </div>
            </Upload>
          </FormItem>
        </Form>
        <div class='footer'>
          <Button type='primary' @click='submit'>{{projectFeild.id ? "修改" : "新增"}}</Button>
          <Button @click='dismissDraw'>取消</Button>
        </div>
      </div>
    </Drawer>
  </div>
</template>

<script>
import ProjectItem from './components/project-item'
export default {
  name: 'Project',
  components: {
    project: ProjectItem,
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
      this.$store.dispatch('mock/getProjectsList')
    },
    uploadImg(file) {
      this.$store.dispatch('common/uploadImg', { file })
        .then(({ data: { url }}) => {
          this.projectFeild = {
            ...this.projectFeild,
            img: url,
          }
        })
      return false
    },
    submit() {
      const { id } = this.projectFeild
      if (id) {
        this.editProject()
      } else {
        this.addProject()
      }
    },
    dismissDraw() {
      this.drawerVisible = false
      this.projectFeild = {
        id: '',
        name: '',
        description: '',
        img: '',
      }
    },
    addProject() {
      const { name, description, img } = this.projectFeild
      this.$refs.form.validate(success => {
        if (success) {
          this.$store.dispatch('mock/insertProject', { name, description, img })
            .then(() => {
              this.drawerVisible = false
              this.fetchList()
            })
        }
      })
    },
    editProject() {
      const { id, name, description, img } = this.projectFeild
      this.$refs.form.validate(success => {
        if (success) {
          this.$store.dispatch('mock/updateProject', { id, name, description, img })
            .then(() => {
              this.drawerVisible = false
              this.fetchList()
            })
        }
      })
    },
    edit(p) {
      const { id, img, name, description } = p
      this.projectFeild = { id, img, name, description }
      this.drawerVisible = true
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
  .content{
    height: 100%;
    display: flex;
    flex-direction: column;
    .form{
      flex: 1;
      padding: 16px;
      overflow: auto;
      .img-wrapper{
        width: 100%;
        max-height: 170px;
        img{
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }
    .footer{
      border-top: 1px solid #e8eaec;
      padding: 16px;
      text-align: right;
    }
  }
}
</style>

