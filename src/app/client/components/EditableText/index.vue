<template>
  <Input
    :class='`cp editable-text ${editable ? "" : "no-border"}`'
    v-model='editValue'
    :placeholder='placeholder'
    :readonly='!editable'
    :icon='editable ? "ios-checkmark-circle-outline": loading ? "ios-loading" : "empty"'
    @on-focus='editable = true'
    @on-click='() => {$emit("input", editValue);editable = false;}'
    style='width: auto;'>
  </Input>
</template>

<script>
export default {
  name: 'EditableText',
  props: {
    value: {
      type: [Number, String],
      default: '',
    },
    placeholder: {
      type: String,
      default: '',
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      editable: false,
      editValue: '',
      iconVisible: false,
    }
  },
  watch: {
    value: function (val) {
      this.editValue = val
    },
  },
  mounted() {
    this.editValue = this.value || ''
  },
  methods: {},
}
</script>

<style lang="scss" scoped>
.editable-text{
  display: inline-block;
}
.no-border{
  & /deep/ .ivu-input{
    border: none;
    box-shadow: none;
    cursor: pointer;
  }
}
</style>

