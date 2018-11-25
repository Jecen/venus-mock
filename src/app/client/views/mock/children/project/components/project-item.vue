<template>
  <Card class='cp project'>
    <div
      slot='title'
      class='header'
      @mouseleave='isHover = false'
      @mouseenter='isHover = true'>
      <span class='name'>
        <Button
          class='set-btn'
          size='small'
          icon='md-settings'
          @click='$emit("edit")'
          type='text' />
        <Button class='name-btn' type='text' @click='$router.push(`/mock/overview/${source.id}`)'>{{source.name}}</Button>
      </span>
      <span class='description'>
        {{source.description}}
      </span>
    </div>
    <div class='detail-content'>
      <div class='info-content'>
        <p class='info-row'>
          <span class='des'>域名数:</span>
          <lcd-number
            class='host-count'
            :value='source.hostCount'
            color='#19be6b'
            size='35'
            background='#fff'
            defaultColor='#e8eaec' />
        </p>
        <p class='info-row'>
          <span class='des'>接口数:</span>
          <lcd-number
            class='host-count'
            :value='source.apiCount'
            color='#19be6b'
            size='35'
            background='#fff'
            defaultColor='#e8eaec' />
        </p>
        <p class='info-row'>
          <span class='des'>方法数:</span>
          <lcd-number
            class='host-count'
            :value='source.methodCount'
            color='#19be6b'
            size='35'
            background='#fff'
            defaultColor='#e8eaec' />
        </p>
      </div>
      <div class='mock-count'>
        <span>总共 mock</span>
        <lcd-number
          class='count'
          :value='source.recordCount'
          color='#515a6e'
          size='55'
          background='#fff'
          defaultColor='#fff' />
        <span>次</span>
      </div>


      <Poptip
        confirm
        class='del-btn-wrapper'
        trigger='click'
        transfer
        v-if='source.hostCount === 0'
        placement='top-end'
        title='确认删除?'
        @on-ok='$emit("del")'>
        <Button
          class='del-btn'
          size='small'
          icon='md-trash'
          type='text' />
      </Poptip>
      <keep-alive>
        <venus-waves
          class='waves'
          num='4'
          color='rgba(51,95,200, 0.3)'
          svgHeight='60'
          animation='animation' />
      </keep-alive>
    </div>
  </Card>
</template>

<script>
export default {
  name: 'PrjectItem',
  props: {
    info: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      isHover: false,
    }
  },
  computed: {
    source() {
      const { id, name, description, records: { total: recordCount }, hosts } = this.info
      const { total: hostCount, list } = hosts
      let apiCount = 0, methodCount = 0
      list.forEach(({ apis: { total, list: methodList }}) => {
        apiCount += total
        methodList.forEach(({ methods: { total }}) => {
          methodCount += total
        })
      })
      return {
        id, name, description, recordCount, hostCount, apiCount, methodCount,
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.project{
  text-align: left;
  & /deep/ .ivu-card-head{
    padding: 0 16px;
  }
  & /deep/ .ivu-card-body{
    padding: 0;
    background-color: transparent;
  }
  .header{
    height: 50px;
    line-height: 50px;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .name{
      font-weight: 600;
      .name-btn{
        font-weight: 600;
        padding: 0;
        font-size: 14px;
      }
      .set-btn{
        font-size: 16px;
        padding: 1px 2px 2px;
      }
    }
    .description{
      flex: 1;
      color: #999;
      font-size: 12px;
      font-weight: normal;
      text-align: right;
    }
  }
  .detail-content{
    position: relative;
    height: 110px;
    border-radius: 4px;
    overflow: hidden;
    .info-content{
      padding: 16px;
      display: flex;
      align-items: center;
      .info-row{
        height: 30px;
        display: flex;
        align-items: center;
        margin-right: 20px;
        .des{
          display: inline-block;
          font-weight: 500;
          margin-right: 10px;
        }
        .description{
          color: #666;
          font-size: 12px;
        }
      }
    }
    .mock-count{
      position: absolute;
      top: 10px;
      right: 30px;
      height: 75px;
      display: flex;
      align-items: flex-end;
      color: #515a6e;
      border-bottom: 2px solid #5cadff;
      span{
        padding-bottom: 5px;
        color: #333;
        font-weight: 500;
        font-style: italic;
      }
    }
    .del-btn-wrapper{
      position: absolute;
      bottom: 5px;
      right: 5px;
      z-index: 1;
      .del-btn{
        color: #57a3f3;
        font-size: 18px;
        outline: none;
        box-shadow: none;
        &:hover{
          background-color: transparent;
          color: #fff;
        }
      }
    }
    .waves{
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
    }
  }
}
</style>

