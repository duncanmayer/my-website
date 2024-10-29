<template>
  <div
    v-if="isVisible"
    :class="['modal',modalClass]"
    :style="{ left: position.x + 'px', top: position.y + 'px' }"
    @mousedown.stop
    @mousedown="startDrag"
  >
    <div class="modal-header" @mousedown.stop @mousedown="startDrag">
      <div class="decorative-rectangle"></div>
      <h2>{{ title }}</h2>
      <div class="decorative-rectangle"></div>
      <div class="button-container">
        <button @click="close">X</button>
        <button @click="expand">◰</button>
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
        x: 150,
        y: 100
      },
      isDragging: false,
      dragOffset: { x: 0, y: 0 },
      isEnlarged: false
    }
  },
  methods: {
    close() {
      this.$emit('close')
    },
    expand() {
      const modal = document.querySelector(`.modal.${this.modalClass}`);
      let clientX = this.position.x;
      let clientY = this.position.y;
      let margin = 25;

      if (modal) {
        // needs to shrink
        if (this.isEnlarged) {
          modal.style.width = `${.60 * (this.bounds.right - this.bounds.left)}px`;
          modal.style.height = `${.72 * (this.bounds.bottom - this.bounds.top)}px`;
          this.isEnlarged = false;

        // needs to expand
        } else {
          let calcWidth = .70 * (this.bounds.right - this.bounds.left);
          let calcHeight = .82 * (this.bounds.bottom - this.bounds.top);

          // check if modal expands past rightward bound
          if (calcWidth + this.position.x > this.bounds.right - this.bounds.left) {
            clientX = (this.bounds.right - this.bounds.left) - calcWidth - margin;
          }

          // check if modal expands past downward bound
          if (calcHeight + this.position.y > this.bounds.bottom - this.bounds.top) {
            clientY = (this.bounds.bottom - this.bounds.top) - calcHeight - margin;
          }

          // force a rerender - found that modal would not immediately update size until
          // an event triggered it.  We can either mimic mouse movement or rAF
          requestAnimationFrame(() => {
            modal.style.width = `${calcWidth}px`;
            modal.style.height = `${calcHeight}px`;
            this.position.x = clientX;
            this.position.y = clientY;
          });

          this.isEnlarged = true;
        }
      }
    },
    startDrag(event) {
      this.isDragging = true
      this.dragOffset.x = event.clientX - this.position.x
      this.dragOffset.y = event.clientY - this.position.y
    },
    stopDrag() {
      this.isDragging = false
    },
    drag(event) {
      if (this.isDragging) {
        const self = document.querySelector('.modal')
        const selfBounds = self.getBoundingClientRect()

        const margin = 1
        const navBarHeight = 25
        const paddingSize = 50

        // note to self: fix this crazy calculation
        // ensure that X value is within screen bounds
        let newX = event.clientX - this.dragOffset.x
        newX = Math.max(2 * margin, newX)
        newX = Math.min(this.bounds.right - this.bounds.left - selfBounds.width - 2 * margin, newX)

        // ensure that Y value is within screen bounds
        let newY = event.clientY - this.dragOffset.y
        newY = Math.max(navBarHeight + margin, newY)
        newY = Math.min(this.bounds.bottom - selfBounds.height - (navBarHeight + paddingSize), newY)

        this.position.x = newX
        this.position.y = newY
      }
    }
  },
  created() {
    document.addEventListener('mousemove', this.drag)
    document.addEventListener('mouseup', this.stopDrag)
  },
  beforeUnmount() {
    document.removeEventListener('mousemove', this.drag)
    document.removeEventListener('mouseup', this.stopDrag)
  }
}
</script>

<style scoped>
.modal {
  background: lightgray;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  width: 500px;
  height: 400px;
  position: absolute;
  display: grid;
  grid-template-rows: auto 1fr;
  font-family: 'Chicago', sans-serif;
  user-select: none;
  color:black;
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
