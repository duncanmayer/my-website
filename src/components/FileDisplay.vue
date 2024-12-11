<template>
  <div
    v-if="isVisible"
    :class="['modal', modalClass]"
    :style="{
      left: position.x + 'px',
      top: position.y + 'px',
      width: bounds.width - 20 + 'px',
      height: bounds.height - 45 + 'px'
    }"
  >
    <div class="modal-header">
      <div class="decorative-rectangle"></div>
      <h2>{{ title }}</h2>
      <div class="decorative-rectangle"></div>
      <div class="button-container">
        <button @click="close">X</button>
      </div>
    </div>
    <div class="modal-wrapper">
      <div class="modal-content">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    isVisible: {
      type: Boolean,
      required: true
    },
    title: {
      type: String,
      default: 'Modal Title'
    },
    bounds: {
      required: true
    },
    modalClass: {
      type: String,
      required: true,
      default: ''
    }
  },
  data() {
    return {
      position: {
        x: 10,
        y: 35
      }
    }
  },
  methods: {
    close() {
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.modal {
  background: lightgray;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  position: absolute;
  display: grid;
  grid-template-rows: auto 1fr;
  font-family: 'Chicago', sans-serif;
  user-select: none;
  color: black;
}

.modal-header {
  display: flex;
  align-items: center;
  height: 30px;
  width: 100%;
}

.modal-header > h2 {
  flex-shrink: 0;
  text-align: center;
  padding: 5px;
}

.modal-header .button-container {
  display: flex;
}

.modal-header > div > button {
  float: right;
  margin: 5px;
  margin-left: 0;
  height: 20px;
  width: 20px;
  padding-left: 0;
  padding-right: 1px;
  border: 2px solid rgba(0, 0, 0, 0.7);
  box-shadow: 2px 2px 3px rgba(255, 255, 255, 0.6);
}

.modal-wrapper {
  border-top: 2px solid black;
  border-left: 2px solid black;
  border-bottom: 1px solid black;
  border-right: 1px solid black;
  margin: 5px;
  align-self: stretch;
  display: flex;
  background-image: url('../assets/moreaccuratemaybe.png');
  background-color: rgba(255, 255, 255, 0.5);
  background-blend-mode: overlay;
  flex: 1;
  overflow-y: auto;
}

.modal-content {
  padding: 2px;
  margin: 10px;
  margin-top: 30px;
  border-right: 3px solid black;
  border-bottom: 3px solid black;
  flex-grow: 1;
  box-shadow: 2px 2px 0px rgba(0, 0, 0, 0.5);
  background-color: #f1efe9;
  border-top: 1px dashed black;
}

.decorative-rectangle {
  flex: 1;
  height: 60%;
  background: repeating-linear-gradient(
    to bottom,
    rgba(128, 128, 128, 0.3),
    rgba(128, 128, 128, 0.3) 2px,
    rgba(211, 211, 211, 0.3),
    rgba(211, 211, 211, 0.3) 4px
  );
  margin: 5px;
  border: 1px solid darkgrey;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.3);
  border-top: 2px solid darkgray;
  border-bottom: 2px solid darkgray;
}
</style>
