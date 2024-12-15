<template>
  <div class="localIcon">
    <img :src="computedSrc" :alt="alt" :style="iconStyle" />
  </div>
</template>

<script>
import fruitLogo from '@/assets/icons/fruit_logo.png'

export default {
  name: 'localIcon',
  props: {
    src: {
      type: String,
      required: true
    },
    width: {
      type: String,
      default: '10px'
    },
    height: {
      type: String,
      default: '10px'
    },
    alt: {
      type: String,
      default: 'Icon'
    }
  },
  computed: {
    computedSrc() {
      return fruitLogo
    },
    iconStyle() {
      return {
        width: this.width,
        height: this.height
      }
    }
  }
}
</script>

<style scoped>
.icon {
  display: inline-block;
}
</style>
