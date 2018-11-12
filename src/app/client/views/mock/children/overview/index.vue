<template>
  <div class='page host-page'>
    <project-info :info='project' />
    <div class='content'>
      <div class='host-content'>
        <host-box
          v-for='h in hosts'
          :key='h.id'
          :host='h'
          :apis='apiMap[h.id] || []'
          @apiVisible='(v) => fetchApis(h, v)'
          @update='getDate()' />
      </div>
      <div class='method-content'>
        <Affix :offset-top='64'>
          <span class='demo-affix'>Method</span>
        </Affix>
      </div>
    </div>
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
      hosts: [],
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
    }
  },
  computed: {
  },
  mounted() {
    this.getDate()
    this.$store.dispatch('common/getDict', { name: 'mockType' })
  },
  methods: {
    async getDate() {
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
    display: flex;
    background-color: #fff;
    .method-content{
      width: 400px;
    }
    .host-content{
      flex: 1;
    }
  }
}
</style>

