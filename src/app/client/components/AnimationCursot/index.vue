<template>
  <div class='cursor'>
    <i
      v-for='(l, index) in location'
      :key='index'
      :style='`transform: translateX(${l[0] - 5}px) translateY(${l[1] - 5}px) scale(${1 - index * 0.05});`' />
  </div>
</template>

<script>
export default {
  name: 'AnimationCursor',
  data() {
    return {
      location_0: [0, 0],
      location_1: [0, 0],
      location_2: [0, 0],
      location_3: [0, 0],
      location_4: [0, 0],
      location_5: [0, 0],
      location_6: [0, 0],
      location_7: [0, 0],
    }
  },
  computed: {
    location() {
      return [
        this.location_0,
        this.location_1,
        this.location_2,
        this.location_3,
        this.location_4,
        this.location_5,
        this.location_6,
        this.location_7,
      ]
    },
  },
  mounted() {
    document.addEventListener('mousemove', (e) => {
      const { x, y } = e
      const fun = (n) => {
        setTimeout(() => {
          this[`location_${n}`] = [x, y]
        }, n * 5)
        if (n < 7) {
          fun(n + 1)
        }
      }
      fun(0)
    })
  },
}
</script>

<style lang="scss" scoped>
.cursor{
  pointer-events: none;
  position: fixed;
  display: block;
  border-radius: 0;
  transform-origin: center center;
  mix-blend-mode: difference;
  top: 0;
  left: 0;
  z-index: 1000;
  i{
    position: absolute;
    display: block;
    width: 10px;
    height: 10px;
    border-radius: 100%;
    transform-origin: center center;
    transform: translate(-50%, -50%);
    background-color: #feaea7;
  }
}
</style>

