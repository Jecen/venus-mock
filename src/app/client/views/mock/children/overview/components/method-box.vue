<template>
  <article class='cp method-box'>
    <header>
      <h1>Developer Host <span class='count'>[{{count}}]</span> </h1>
    </header>
    <section>
      <ul>
        <li v-for='itm in list' :key='itm.id'>
          {{itm.name}}
        </li>
      </ul>
    </section>
    <footer>
      <Button>add developer </Button>
    </footer>
  </article>
</template>

<script>
export default {
  name: 'MethodBox',
  data() {
    return {
      list: [],
    }
  },
  computed: {},
}
</script>

<style lang="scss" scoped>
.method-box{
  width: 100%;
  height: 100%;
  padding: 5px;

  .method-info{
    width: 100%;
    height: 100%;
    padding: 10px 16px;
    border: 2px solid #e5e6e7;
    border-radius: 4px;
    .title{
      text-align: left;
      margin-bottom: 10px;
    }
    .sub-title{
      text-align: left;
      margin-bottom: 4px;
      text-indent: 20px;
    }
    .params-itm{
      border-bottom: 1px dashed #e5e6e7;
      display: flex;
      align-items: center;
      .params-key{
        color: #17233d;
        font-weight: 500;
        display: inline-block;
        width: 100px;
        padding-left: 16px;
        text-align: left;
        font-size: 14px;
      }
      .params-type{
        color: #17233d;
        font-weight: 500;
        display: inline-block;
        width: 90px;
        text-align: left;
        .type{
          font-style: italic;
          font-weight: 600;
          color: #faad14;
        }
      }
      .params-name{
        color: #515a6e;
        font-weight: 500;
        display: inline-block;
        width: 150px;
        text-align: left;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
      }
      .params-required{
        display: inline-block;
        width: 60px;
        text-align: left;
      }
      .params-info{
        color: #808695;
        font-weight: 500;
        display: inline-block;
        text-align: left;
        flex: 1;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
      }
      .itm-btn{
        padding: 0 ;
        margin-right: 16px;
      }
    }
  }
  .holder{
    & *{
      background-color: #e5e5e5;
    }
  }
}
</style>
