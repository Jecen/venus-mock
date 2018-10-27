<template>
  <layer>
    <router-view />
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

