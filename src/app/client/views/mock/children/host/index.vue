<template>
  <div class='page host-page'>
    <Table :columns='hostColumn' :data='list' />
  </div>
</template>

<script>
export default {
  name: 'Host',
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
    }
  },
  computed: {
    list() {
      return this.$store.getters['mock/hosts']
    },
  },
  mounted() {
    this.fetchList()
  },
  methods: {
    fetchList() {
      this.$store.dispatch('mock/getHostList')
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

