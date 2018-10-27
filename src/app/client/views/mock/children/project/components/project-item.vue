<template>
  <Card class='cp project' @click='$emit("click", info)'>
    <div slot='title' class='header'>
      <span class='name'>{{info.name}} </span>
      <lcd-number
        class='count'
        :value='info.recordCount'
        color='#19be6b'
        size='30'
        background='#fff'
        defaultColor='#fff' />
      <span>次</span>
    </div>
    <p>{{info.description}}</p>
  </Card>
</template>

<script>
export default {
  name: 'PrjectItem',
  props: {
    info: {
      type: Object,
      default: () => ({
        name: 'PROJECT-NAME',
        description: 'PROJECT-DESCRIPTION',
        hostCount: 0,
        id: 0,
        img: null,
        recordCount: 5,
        crDate: '',
      }),
    },
  },
}
</script>

<style lang="scss" scoped>
.project{
  text-align: left;
  width: 400px;
  & /deep/ .ivu-card-head{
    padding: 0 16px;
  }
  .header{
    height: 50px;
    line-height: 50px;
    font-weight: 500;
    display: flex;
    align-items: center;
    .name{
      flex: 1;
    }
    .count{
    }
  }
}
</style>

