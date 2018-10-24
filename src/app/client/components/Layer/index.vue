<template>
  <div class='layout'>
    <Layout>
      <Header>
        <Menu mode='horizontal' theme='dark' active-name='1'>
          <div class='layout-logo' />
          <div class='layout-nav'>
            <MenuItem name='1'>
              <Icon type='ios-navigate' />
              Item 1
            </MenuItem>
            <MenuItem name='2'>
              <Icon type='ios-keypad' />
               Item 2
            </MenuItem>
            <MenuItem name='3'>
              <Icon type='ios-analytics' />
              Item 3
            </MenuItem>
            <MenuItem name='4'>
              <Icon type='ios-paper' />
              Item 4
            </MenuItem>
          </div>
        </Menu>
      </Header>
      <Content :style='{padding: "0 50px"}'>
        <Breadcrumb :style='{margin: "20px 0"}'>
          <BreadcrumbItem>Home</BreadcrumbItem>
          <BreadcrumbItem>Components</BreadcrumbItem>
          <BreadcrumbItem>Layout</BreadcrumbItem>
        </Breadcrumb>
        <Card>
          <div style='min-height: 200px;'>
            <slot />
          </div>
        </Card>
      </Content>
      <Footer class='layout-footer-center'>2011-2016 &copy; TalkingData</Footer>
    </Layout>
  </div>
</template>

<script>
export default {
  name: 'Layer',
}
</script>

