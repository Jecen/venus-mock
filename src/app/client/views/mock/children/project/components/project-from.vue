<template>
 <div class='cp project-form'>
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
      <Button @click='dismissDraw(false)'>取消</Button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProjectForm',
  data() {
    return {
      projectFeild: {
        id: '',
        name: '',
        description: '',
        img: '',
      },
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
  methods: {
    setFeild(values) {
      this.projectFeild = Object.assign({}, values)
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
    dismissDraw(needUpdate = true) {
      this.$emit('finish', needUpdate)
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
              this.dismissDraw()
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
              this.dismissDraw()
            })
        }
      })
    },
  },
}
</script>


<style lang="scss" scoped>
  .project-form{
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
</style>

