<template>
  <div class='cp project-info'>
    <auto-img class='logo' :src='info.img' alt='project-logo' />
    <div class='info-content'>
      <p class='name'>{{info.name}}</p>
      <p class='description'>{{info.description}}</p>
    </div>
    <div class='dashboard'>
      <p>创建日期：{{info.crDate}}</p>
      <p>模拟次数：{{info.records}}</p>
      <p>模拟成功：{{info.successCount}}</p>
      <p>模拟失败：{{info.failureCount}}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProjectInfo',
  props: {
    info: {
      type: Object,
      default: () => ({
        name: '[NAME]',
        description: '[DESCRIPTION]',
        img: '111',
        mockCount: 0,
      }),
    },
  },
  computed: {
  },
  mounted() {
  },
  methods: {
  },
}
</script>

<style lang="scss" scoped>
.project-info{
  display: flex;
  padding: 20px;
  .logo{
    width: 150px;
    height: 150px;
    border-radius: 150px;
    border: 2px solid #e7e8e9;
    background-color: #999;
    object-fit: cover;
  }
  .info-content{
    flex: 1;
    text-align: left;
    margin-left: 20px;
    padding: 20px 0;
    .name{
      font-size: 28px;
      font-weight: 600;
    }
    .description{
      font-size: 14px;
      color: #999;
      font-style: italic;
      text-indent: 40px;
    }
  }
  .dashboard{
    text-align: left;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    p{
      font-size: 14px;
      color: #939393;
    }
  }
}
</style>


