<template>
  <div class="navigationBar">
    <ul class="navContainer">
      <li class="navElement"><local-icon src="fruit_logo.png" width="20px" height="20px" /></li>
      <li class="btn navElement">
        <button
          @click="toggleDropdown('fileDropdown')"
          :class="{ highlighted: isHighlighted('fileDropdown') }"
        >
          File
        </button>
        <div v-if="activeDropdown === 'fileDropdown'" class="dropdown">
          <button class="dropdownElement" @click="performAction('New')">New</button>
          <button class="dropdownElement" @click="performAction('Open')">Open</button>
          <button class="dropdownElement" @click="performAction('Save')">Save</button>
        </div>
      </li>
      <div v-if="isInFile">
        <li class="btn navElement">
          <button
            @click="toggleDropdown('editDropdown')"
            :class="{ highlighted: isHighlighted('editDropdown') }"
          >
            Edit
          </button>
          <div v-if="activeDropdown === 'editDropdown'" class="dropdown">
            <button class="dropdownElement" @click="performAction('Undo')">Undo</button>
            <button class="dropdownElement" @click="performAction('ShowClipboard')">
              Clipboard
            </button>
            <button class="dropdownElement" @click="performAction('SelectAll')">SelectAll</button>
          </div>
        </li>
      </div>
      <div v-else>
        <li class="btn navElement">
          <button
            @click="toggleDropdown('toolsDropdown')"
            :class="{ highlighted: isHighlighted('toolsDropdown') }"
          >
            Tools
          </button>
          <div v-if="activeDropdown === 'toolsDropdown'" class="dropdown">
            <button class="dropdownElement" @click="performAction('OpenPaint')">Paint</button>
            <button class="dropdownElement" @click="performAction('OpenNotes')">Notes</button>
            <button class="dropdownElement" @click="performAction('FindFun')">Fun</button>
          </div>
        </li>
        <li class="btn navElement">
          <button
            @click="toggleDropdown('helpDropdown')"
            :class="{ highlighted: isHighlighted('helpDropdown') }"
          >
            Help
          </button>
          <div v-if="activeDropdown === 'helpDropdown'" class="dropdown">
            <button class="dropdownElement" @click="performAction('FAQ')">FAQ</button>
            <button class="dropdownElement" @click="emit('toggleReview')">Review</button>
            <button class="dropdownElement" @click="emit('toggleContact')">Contact</button>
            <button class="dropdownElement" @click="emit('toggleWelcome')">Welcome</button>
          </div>
        </li>
      </div>
      <li class="user-profile-pic navElement">
        <img :src="profilePhoto" alt="User Profile Photo" />
      </li>
      <li class="time navElement">{{ currentTime }}</li>
    </ul>
  </div>
</template>

<script>
import LocalIcon from './icons/IconLocal.vue'
import profilePhoto from '../assets/profiles/funnyfaceguy.png'

export default {
  data: function () {
    return {
      activeDropdown: null,
      currentTime: '',
      profilePhoto
    }
  },
  props: {
    isInFile: {
      type: Boolean,
      required: false
    }
  },
  components: {
    LocalIcon
  },
  methods: {
    emit(toToggle) {
      this.activeDropdown = null
      console.log(`Emitting from nav ${toToggle}`)
      this.$emit(toToggle)
    },
    handleClickOutside(event) {
      const isButton = event.target.closest('button')
      const isDropdown = event.target.closest('.dropdown')
      if (!isButton && !isDropdown) {
        this.activeDropdown = null
      }
    },
    time() {
      const now = new Date()
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')

      this.currentTime = `${hours}:${minutes}`
    },
    toggleDropdown(dropdown) {
      console.log(`toggling ${dropdown}`)
      this.activeDropdown = this.activeDropdown === dropdown ? null : dropdown
    },
    performAction(action) {
      console.log(`${action} action performed`)
    },
    isHighlighted(element) {
      return this.activeDropdown === element
    }
  },
  created() {
    document.addEventListener('click', this.handleClickOutside)
    this.time()
    setInterval(this.time, 1000)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
    clearInterval(this.time)
  }
}
</script>

<style scoped>
.navContainer .highlighted {
  background-color: blue;
  padding: 0 15px;
  transition: all 0.3s ease;
}

.navContainer .dropdown .dropdownElement {
  display: block;
  padding: 5px 10px 10px 10px;
  border: none;
  background: lightgray;
  text-align: center;
  font-size: 17px;
  max-width: 63px;
}

.navigationBar {
  background-color: black;
  height: 25px;
  width: 100%;
  display: flex;
  user-select: none;
}

.navContainer {
  /* position: absolute; */
  display: inline-block;
  padding: 0;
  background-color: lightgray;
  border-radius: 7px 7px 0 0;
  width: 100%;
  z-index: 1000;
}

.navContainer .navElement {
  display: inline;
  float: left;
  color: black;
  height: 25px;
  align-content: center;
  font-family: 'Chicago', sans-serif;
  font-size: 20px;
}

.navContainer .dropdownElement {
  display: inline;
  float: left;
  padding: 3px 15px 0px 15px;
  color: black;
  font-size: 20px;
}

.navContainer button {
  display: inline;
  float: left;
  color: black;
  height: 25px;
  align-content: center;
  font-family: 'Chicago', sans-serif;
  font-size: 20px;
  background-color: lightgray;
  border: none;
  padding: 4px 0 0 0;
  width: 65px;
}

.localIcon {
  vertical-align: middle;
  padding: 2px 15px 0 15px;
}

.navContainer .time {
  float: right;
  padding-right: 15px;
}

.navContainer .user-profile-pic {
  float: right;
  margin-right: 15px;
  padding-top: 1px;
}

.btn {
  position: relative;
}

/* fix this later*/
.navContainer .dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  display: flex;
  flex-direction: column;
  z-index: 1000;
  border: 1px solid black;
  box-sizing: border-box;
}
</style>
