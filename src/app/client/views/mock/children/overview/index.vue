<template>
  <div class='page host-page'>
    <project-info :info='project' />
    <host-box v-for='h in hosts' :key='h.id' :host='h' />
  </div>
</template>

<script>
import projectInfo from './components/project-info'
import hostBox from './components/host-box'
export default {
  name: 'Host',
  components: {
    'project-info': projectInfo,
    'host-box': hostBox,
  },
  data() {
    return {
      project: '',
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
    }
  },
  computed: {
    hosts() {
      return this.$store.getters['mock/hosts']
    },
  },
  mounted() {
    this.fetchList()
    this.getProjectInfo()

    //! test
    this.$store.dispatch('mock/getMethodList')
    this.$store.dispatch('common/getDict', { name: 'method' })
  },
  methods: {
    async getProjectInfo() {
      const { projectId: id } = this.$route.params
      try {
        const rst = await this.$store.dispatch('mock/getProjectById', { id })
        this.project = rst.data
      } catch (error) {
        console.log(error)
      }
    },
    fetchList() {
      const { projectId: id } = this.$route.params
      const parmas = {
        id,
      }
      this.$store.dispatch('mock/getHostList', parmas)
        .then(({ data: { list }}) => {
          console.log(list)
        })
        .catch(e => {
          console.log(e)
        })
    },
  },
}
</script>

<style lang="scss" scoped>
.host-page{
  height: 100%;
  background-color: #fff;
}
</style>

