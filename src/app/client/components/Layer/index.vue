<template>
  <Layout class='layout'>
    <Header>
      <div class='layout-logo'>Venus Mock</div>
    </Header>
    <Content :style='{height: "max-content"}'>
      <div style='width:100%;height:100%;padding:20px 20px 0;'>
        <slot />
      </div>
    </Content>
    <Footer class='layout-footer-center'>2018 &copy; VenusMock</Footer>
  </Layout>
</template>

<script>
export default {
  name: 'Layer',
  mounted() {
  },
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
  .breadcrumb{
    width: 100%;
    height: 50px;
    line-height: 50px;
    padding: 0 20px;
    background-color: #fff;
  }
}
</style>

