<template>
  <layer>
    <router-view />
    <animation-cursor />
  </layer>
</template>

<script>
export default {
  name: 'Mock',
  created() {
    this.$mockSocket.connect()
  },
}
</script>

<style lang="scss" scoped>

</style>

