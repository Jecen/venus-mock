<template>
  <img
    ref='img'
    :src='imgSrc'
    alt='project-logo'>
</template>

<script>
export default {
  name: 'AutoImg',
  props: {
    src: {
      type: String,
      default: '',
    },
    alt: {
      type: String,
      default: 'img',
    },
    defaultSrc: {
      type: String,
      default: require('root/assets/img/img-error.png'),
    },
  },
  data() {
    return {
      imgSrc: this.src || this.defaultSrc,
      isError: !this.src,
    }
  },
  mounted() {
    this.$refs.img.onerror = () => this.onImgError()
  },
  methods: {
    onImgError() {
      this.isError = true
      this.imgSrc = this.defaultSrc
    },
  },
}
</script>

