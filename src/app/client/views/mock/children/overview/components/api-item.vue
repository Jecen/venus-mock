<template>
  <div class='cp api-item' :style='host.online === 1 ? "" : `filter: grayscale(100%);`' v-if='api'>
    <p class='api-name'>
      {{api.name}}
      <RadioGroup
        class='radio'
        size='small'
        v-model='apiType'
        type='button'>
        <Radio v-for='opt in typeDict.options' :key='opt.id' :label='opt.id'>{{opt.name}}</Radio>
      </RadioGroup>
      <span class='url'>{{host.protocolName}}://{{host.host}}{{host.path}}{{api.url}}</span>
    </p>
    <p class='method-box'>
      <span class='des'>Method: </span>
      <Button
        class='method-btn'
        size='small'
        v-for='m in api.methods'
        :key='m.id'
        type='text'>
        {{m.methodName.toUpperCase()}}
      </Button>
      <Button
        class='method-btn add-btn'
        size='small'
        icon='md-add-circle'
        ghost
        type='text' />
      <i style='flex: 1;' />
      <span class='api-date'>{{api.crDate}}</span>
    </p>
  </div>
</template>

<script>
export default {
  name: 'ApiItem',
  props: {
    host: {
      type: Object,
      default: null,
    },
    api: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      apiType: this.api.type || '',
    }
  },
  computed: {
    typeDict() {
      return this.$store.getters['common/dict']('mockType') || { options: [] }
    },
  },
  watch: {
    api: function (val) {
      this.apiType = val.type
    },
  },
  mounted() {
    this.$store.dispatch('common/getDict', { name: 'mockType' })
  },
  methods: {
  },
}
</script>

<style lang="scss" scoped>
.api-item{
  width: 100%;
  height: 80px;
  border-radius: 4px;
  border: 1px solid #2d8cf0;
  padding: 6px 16px;
  transition: all .3s ease;
  .api-name{
    height: 30px;
    line-height: 30px;
    font-size: 16px;
    font-weight: 500;
    .radio{
      margin-left: 20px;
      & /deep/ label{
        background-color: transparent;
        border-color: #2d8cf0;
        color: #2d8cf0;
      }
      & /deep/ .ivu-radio-wrapper-checked{
        background-color: #2d8cf0;
        color: #fff;
      }
    }
    .url{
      margin-left: 20px;
      color: #515a6e;
      font-size: 14px;
      font-style: italic;
      text-decoration: underline;
    }
    .api-date{
      float: right;
      font-size: 12px;
      color: #515a6e;
    }
  }
  .method-box{
    height: 40px;
    line-height: 40px;
    display: flex;
    align-items: center;
    .des{
      color: #17233d;
      font-size: 14px;
      font-weight: 500;
      margin-right: 5px;
    }
    .method-btn{
      padding: 0 7px 2px;
      font-weight: 500;
      font-size: 16px;
      box-shadow: none;
      color: #2d8cf0;
      text-shadow: 0px 0px 0px #2d8cf0;
      transition: all .1s ease;
      &:focus{
        text-shadow: 0px 0px 3px #2d8cf0;
      }
      &:hover{
        text-shadow: 0px 0px 3px #2d8cf0;
      }
    }
    .add-btn{
      color: #808695;
      text-shadow: none;
      &:focus{
        text-shadow: none;
      }
      &:hover{
        text-shadow: none;
        color: #2d8cf0;
      }
    }
  }
}
</style>

