<template>
  <div class="app">
    <NavBar
      class="navBar"
      @toggleWelcome="toggleModal('welcomeModal')"
      @toggleContact="toggleModal('contactModal')"
      @toggleReview="toggleModal('reviewModal')"
    >
    </NavBar>

    <DraggableModal
      class="welcome"
      :isVisible="isModalVisible.welcomeModal"
      :bounds="bounds"
      title="Welcome! How did you get here?"
      @close="toggleModal('welcomeModal')"
      :style="{ zIndex: getZIndex('welcomeModal') }"
      @click="setNewZIndex('welcomeModal')"
    >
      <p style="font-size: 14px; padding: 9px; overflow-y: auto; max-width: 100%; max-height: 100%">
        It seems you've managed to stumble upon me.. I'm Duncan's computer!! <br />
        Whether the year is 1986 and you saved up all your summer-job money to buy this thing new,
        or just pulled some dusty computer parts out of a sleepy Goodwill in the sticks and taped it
        all together, welcome! Pardon the glitches, my motherboard's seen better days. :]
        <br /><br />
        Why not play around with some of the most exciting parts of my functionality? All my popups
        can move around the screen. It's so much fun to make them dance and wiggle! In my topward
        bar, you can open new windows and interact with my systems as much as you want. There might
        even be some games up there!

        <br /><br />
        Have fun and enjoy! If you're here, just know I love you!!
      </p>
    </DraggableModal>

    <DraggableModal
      :isVisible="isModalVisible.reviewModal"
      :bounds="bounds"
      @close="toggleModal('reviewModal')"
      title="Review"
      :style="{ zIndex: getZIndex('reviewModal') }"
      @click="setNewZIndex('reviewModal')"
    >
      <h2>Leave a review!</h2>
      <p>Make sure you're nice...</p>
      <p><input type="text" id="textInput" placeholder="Type here..." /></p>
      <button>Submit!!!</button>
    </DraggableModal>

    <DraggableModal
      :isVisible="isModalVisible.contactModal"
      :bounds="bounds"
      @close="toggleModal('contactModal')"
      title="Contact Me!"
      :style="{ zIndex: getZIndex('contactModal') }"
      @click="setNewZIndex('contactModal')"
    >
      <div
        style="font-size: 25px; padding: 7px; overflow-y: auto; max-width: 100%; max-height: 100%"
      >
        <p>
          Oh hi! You want to get in touch with me (Duncan)? I love the sound of that! Here are a
          couple of the best ways to contact me:
        </p>
        <ul>
          <li>Email: mayer.du@northeastern.edu</li>
          <li>Phone: 978-818-3526</li>
          <li>
            Smoke Signal: On the 25th day of the 11th month, atop Fort Hill in Boston, release 3
            evenly spaced smoke clouds. I will be ready.
          </li>
        </ul>
      </div>
    </DraggableModal>

    <DesktopFile :bounds="bounds" fileName="DuncanResume.pdf"> </DesktopFile>
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import NavBar from './components/NavBar.vue'
import DraggableModal from './components/DraggableModal.vue'
import DesktopFile from './components/DesktopFile.vue'

let isModalVisible = ref({ welcomeModal: true, contactModal: false, reviewModal: false })
let modalZIndices = ref({ welcomeModal: 1, contactModal: 1, reviewModal: 1 })
let bounds = ref({ width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0 })

const updateDimensions = () => {
  const myElement = document.querySelector('#app')
  if (myElement) {
    const rect = myElement.getBoundingClientRect()

    bounds.value = {
      width: rect.width,
      height: rect.height,
      top: rect.top,
      left: rect.left,
      right: rect.right,
      bottom: rect.bottom
    }
    console.log(JSON.stringify(bounds.value))
  } else {
    console.log(`element not found`)
  }
}

const toggleModal = (modalType: string) => {
  isModalVisible.value[modalType] = !isModalVisible.value[modalType]
  if (isModalVisible.value[modalType]) {
    setNewZIndex(modalType)
  } else {
    modalZIndices.value[modalType] = 0
  }
}

const getZIndex = (modalType: string) => {
  return modalZIndices.value[modalType]
}

const setNewZIndex = (modalType: string) => {
  const maxZIndex = Math.max(...Object.values(modalZIndices.value), 0)
  modalZIndices.value[modalType] = maxZIndex + 1
}

onBeforeMount(() => {
  updateDimensions()
})
window.addEventListener('resize', updateDimensions)
</script>

<style scoped>
.tutorial {
  user-select: none;
}

.navBar {
  width: 100%;
  background-color: black;
}

.app {
  position: relative;
}
</style>
