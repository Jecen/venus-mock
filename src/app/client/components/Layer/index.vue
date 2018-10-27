<template>
  <Layout class='layout'>
    <Header>
      <div class='layout-logo'>Venus Mock</div>
    </Header>
    <Content :style='{height: "max-content",padding: "20px"}'>
       <slot />
    </Content>
    <Footer class='layout-footer-center'>2018 &copy; VenusMock</Footer>
  </Layout>
</template>

<script>
export default {
  name: 'Layer',
}
</script>

<style lang="scss" scoped>
.layout{
  height: 100%;
  overflow: auto;
  .layout-footer-center{
    text-align: center;
  }
  .layout-logo{
    color: #fff;
    font-weight: 600;
    font-size: 30px;
  }
}
</style>

