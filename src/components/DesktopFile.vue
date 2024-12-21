<template>
  <div
    class="desktop-file"
    @mousedown.stop="startDrag"
    :style="{ left: fixedPosition.x + 'px', top: fixedPosition.y + 'px' }"
    @click="detectClick"
  >
    <div class="file-image">
      <img :src="highlightedImage" />
    </div>
    <div class="file-name-wrapper" :class="{ highlighted: isHighlighted || this.isDragging }">
      <div class="file-name-text" :class="fileName">
        {{ fileName }}
      </div>
    </div>
  </div>
</template>

<script>
import fileIcon from '../assets/fileIcons/Text_Edit_48x48x32.png'
import fileIconHighlighted from '../assets/fileIcons/Text_Edit_48x48x32_Highlighted.png'

export default {
  props: {
    fileName: {
      type: String,
      required: true,
      default: 'New Document'
    },
    bounds: {
      required: true
    }
  },
  data() {
    return {
      position: { x: 20, y: 40 },
      fixedPosition: { x: 20, y: 40 },
      isDragging: false,
      dragOffset: { x: 0, y: 0 },
      fileIcon,
      fileIconHighlighted,
      isHighlighted: false,
      numClicks: 0
    }
  },
  computed: {
    highlightedImage() {
      return this.isHighlighted || this.isDragging ? this.fileIconHighlighted : this.fileIcon
    }
  },
  methods: {
    startDrag(event) {
      this.isDragging = true
      this.dragOffset.x = event.clientX - this.position.x
      this.dragOffset.y = event.clientY - this.position.y

      event.preventDefault()
    },
    stopDrag() {
      this.isDragging = false
    },
    drag(event) {
      if (this.isDragging) {
        const self = document.querySelector('.desktop-file')
        const selfBounds = self.getBoundingClientRect()
        const margin = 1
        const navBarHeight = 25
        const paddingSize = 50

        let newX = event.clientX - this.dragOffset.x
        newX = Math.max(2, newX)
        newX = Math.min(this.bounds.right - this.bounds.left - selfBounds.width - 2 * margin, newX)

        let newY = event.clientY - this.dragOffset.y
        // account for height of nav bar
        newY = Math.max(navBarHeight + margin, newY)
        newY = Math.min(this.bounds.bottom - selfBounds.height - (navBarHeight + paddingSize), newY)

        // this.position.x = event.clientX - this.dragOffset.x
        // this.position.y = event.clientY - this.dragOffset.y

        this.position.x = newX
        this.position.y = newY
      }
    },
    toggleHighlight() {
      this.isHighlighted = !this.isHighlighted
    },
    handleClickOutside(event) {
      const isFileIcon = event.target.closest('.desktop-file')
      const isCorrectlyNamed = event.target.closest(`.${this.fileName}`)
      if (!isFileIcon && !isCorrectlyNamed) {
        this.isHighlighted = false
      }
    },
    detectClick: function () {
      this.numClicks++
      if (this.numClicks === 1) {
        var self = this
        this.toggleHighlight()
        // if we recieve 2 clicks within .2 seconds, register as a double click.
        setTimeout(function () {
          switch (self.numClicks) {
            case 1:
              break
            default:
              self.$emit('openFile')
          }
          self.numClicks = 0
        }, 200) // .2 second timer
      }
    }
  },
  created() {
    document.addEventListener('click', this.handleClickOutside)
    document.addEventListener('mousemove', this.drag)
    document.addEventListener('mouseup', this.stopDrag)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
    document.removeEventListener('mousemove', this.drag)
    document.removeEventListener('mouseup', this.stopDrag)
  },
  openFile() {
    this.$emit('openFile', this.fileName)
  }
}
</script>

<style scoped>
.desktop-file {
  position: absolute;
  user-select: none;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.file-image img {
  width: 50px;
  height: 50px;
}

.file-name-wrapper {
  text-align: center;
  background-color: lightgray;
  padding-top: 1px;
  padding-left: 1px;
  padding-right: 2px;
  max-width: 85px;
  display: flex;
  align-items: center;
}

.file-name-text {
  padding-top: 1px;
  font-family: 'Chicago', 'sans-serif';
  color: black;
  height: auto;
  overflow-wrap: break-word;
  line-height: 10px;
  max-width: 100%;
}

.file-name-wrapper.highlighted {
  background-color: black;
}

.file-name-wrapper.highlighted .file-name-text {
  color: white;
}
</style>
