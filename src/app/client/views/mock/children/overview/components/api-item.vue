<template>
  <div class='cp api-item' v-if='api'>
    <p class ='url-row'>
      <span class='des'>Api Url:</span>
      <span class='url'>{{host.protocolName}}://{{host.host}}{{host.path}}{{api.url}}</span>
    </p>
    <span v-for='m in api.methods' :key='m.id'>[{{m.name}}]</span>
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
}
</script>

<style lang="scss" scoped>
.api-item{
  width: 100%;
  height: 80px;
  background-color: aqua;
  border-radius: 4px;
  padding: 4px 16px;
  .url-row{
    .des{
      color: #17233d;
      font-size: 14px;
      font-weight: 500;
      margin-right: 5px;
    }
    .url{
      color: #515a6e;
      font-size: 14px;
      font-style: italic;
    }
  }
}
</style>

