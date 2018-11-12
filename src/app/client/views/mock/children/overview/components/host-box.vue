<template>
  <div class='cp host-box'>
    <div v-if='host' class='info-wrapper'>
      <p :class='["host-title", online === 1 ? "online" : "offline"]' @click.self='showApi()'>
        <i-switch
          class='online-switch'
          :loading='isSwitching'
          size='small'
          v-model='online'
          :title='online === 1 ? "online" : "offline"'
          :trueValue='1'
          :falseValue='0' />
        <span class='host-name' @click.stop='showApi()'>[{{host.name}}]</span>
        <span class='host-url' @click.stop='showApi()'>{{host.protocolName}}://{{host.host}}{{host.path}}/...</span>
        <i style='flex: 1;' @click.stop='showApi()' />
        <Button
          class='btn test-btn'
          title='测试该「域名/路径」下的所有 api'
          @click.stop='testAllApi(host)'
          type='text'>
          TEST
        </Button>
        <Button
          :class='["btn", apiVisible ? "turn-right" : ""]'
          icon='ios-arrow-down'
          type='text'
          @click.stop='showApi()' />
      </p>
      <div class='api-list' :style='`height: ${apiContentHeihgt}px`'>
        <div v-if='apis.length === 0' class='empty-holder'>
          暂无Api,请<a>新增</a>
        </div>
        <div v-esle class='inner-wrapper'>
          <api-item
            class='api-itm'
            v-for='api in apis'
            :host='host'
            :api='api'
            :key='api.id' />
        </div>
      </div>
    </div>
    <div v-else class='info-wrapper holder'>
      <p class='host-title holder-item' />
    </div>
  </div>
</template>

<script>
import apiItem from './api-item'
export default {
  name: 'HostBox',
  components: {
    'api-item': apiItem,
  },
  props: {
    host: {
      type: Object,
      default: null,
    },
    apis: {
      type: Array,
      default: () => ([]),
    },
  },
  data() {
    return {
      api: [],
      online: 1,
      isSwitching: false,
      apiVisible: false,
      isFetchApis: false,
    }
  },
  computed: {
    apiContentHeihgt() {
      const apiItmHeight = 96
      const holderHeight = 64
      const apiHeight = this.apis.length * apiItmHeight
      if (this.apiVisible) {
        if (this.isFetchApis) {
          return 0
        } else if (this.apis.length > 0) {
          return apiHeight
        } else {
          return holderHeight
        }
      }
      return 0
    },
  },
  watch: {
    apiVisible: function (v) {
      this.$emit('apiVisible', v)
    },
    host: function (val) {
      const { online } = val
      this.online = online
    },
    online: function (val) {
      if (val !== this.host.online) {
        this.isSwitching = true
        this.$store.dispatch('mock/updateHost', {
          ...this.host,
          online: val,
        })
          .then(() => {
            this.$emit('update')
          })
          .finally(() => {
            this.isSwitching = false
          })
      }
    },
  },
  mounted() {},
  methods: {
    testAllApi(host) {
      console.log(host)
    },
    showApi() {
      this.apiVisible = !this.apiVisible
    },
  },
}
</script>

<style lang="scss" scoped>
.host-box{
  padding: 14px;
  text-align: left;
  background-color: #fff;
  .info-wrapper{
    .online{
      background: #19be6b;
    }
    .offline{
      background: #ff9900;
    }
    .host-title{
      height: 48px;
      padding: 0 10px 0 20px;
      display: flex;
      align-items: center;
      border-bottom: 1px solid #e7e8e9;
      transition: all .2s ease;
      border-radius: 4px;
      cursor: pointer;
      .online-switch{
        margin-right: 16px;
      }
      .host-name{
        font-size: 18px;
        font-weight: 600;
        margin-right: 10px;
        color: #17233d;
      }
      .host-url{
        font-size: 16px;
        font-style: initial;
        color: #515a6e;
      }
      .test-btn{
        font-size: 18px;
        font-weight: 700;
      }
      .btn{
        padding: 0 3px;
        box-shadow: none;
        color: #515a6e;
        &:hover{
          background: transparent;
          color: #fff;
        }
        & /deep/ .ivu-icon-ios-arrow-down{
          transition: all .6s ease;
          font-size: 24px;
        }
      }
      .turn-right{
         & /deep/ .ivu-icon-ios-arrow-down{
          transform: rotate(-180deg);
        }
      }
    }
    .api-list{
      overflow: hidden;
      transition: height .3s ease;
      .api-holders{
        height: 50px;
        line-height: 50px;
        background-color: #e7e8e9;
      }
      .empty-holder{
        margin-top: 14px;
        height: 50px;
        line-height: 50px;
        background-color: #c5c8ce;
        border-radius: 4px;
        color: #fff;
        text-align: center;
        font-size: 14px;
      }
      .inner-wrapper{
        .api-itm{
          margin-top: 14px;
        }
      }
    }
  }

  .holder-item{
    background-color: #e7e8e9;
  }
}
</style>

