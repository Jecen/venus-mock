<template>
  <div class='cp host-box'>
    <div v-if='host' class='info-wrapper'>
      <p class='host-title'>
        <span class='host-name'>{{host.name}}</span>
        <span class='host-path'>{{host.path}}</span>
        <i style='flex: 1;' />
        <Button
          class='btn'
          icon='md-paper-plane'
          title='测试该「域名/路径」下的所有 api'
          type='primary'>测试</Button>
      </p>
    </div>
    <div v-else class='info-wrapper holder'>
      <p class='host-title holder-item' />
    </div>
  </div>
</template>

<script>
export default {
  name: 'HostBox',
  props: {
    host: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      api: [],
    }
  },
  mounted() {},
  methods: {
    fetchApis() {
      // const { id } = this.host

    },
  },
}
</script>

<style lang="scss" scoped>
.host-box{
  padding: 14px;
  text-align: left;
  .info-wrapper{
    .host-title{
      height: 48px;
      padding: 0 20px;
      display: flex;
      align-items: center;
      border-bottom: 1px solid #e7e8e9;
      .host-name{
        font-size: 18px;
        font-weight: 600;
        margin-right: 10px;
        color: #333;
      }
      .host-path{
        font-size: 14px;
        font-style: initial;
        color: #999;
      }
    }

  }

  .holder-item{
    background-color: #e7e8e9;
  }
}
</style>

