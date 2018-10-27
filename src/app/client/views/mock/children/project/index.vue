<template>
  <div class='page project-page'>
    <project
      class='project'
      v-for='p in list'
      :key='p.id'
      :info='p' />
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
  },
}
</script>

<style lang="scss" scoped>
.project-page{
  height: 100%;
}
</style>

