<template>
  <div class='page host-page'>
    <project-info :info='project' />
    <host-box
      v-for='h in hosts'
      :key='h.id'
      :host='h'
      :apis='apiMap[h.id] || []'
      @apiVisible='(v) => fetchApis(h, v)'
      @update='fetchList()' />
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
    const { projectId: id } = this.$route.params
    this.$store.dispatch('mock/getOverViewDate', { id })
      .then(({ project, host: hosts }) => {
        this.project = project
        this.hosts = hosts
      })
  },
  methods: {
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
  background-color: #fff;
}
</style>

