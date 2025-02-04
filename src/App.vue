<template>
  <div class="app">
    <NavBar
      class="navBar"
      :isInFile="isInFile"
      @toggleWelcome="toggleModal('welcomeModal')"
      @toggleContact="toggleModal('contactModal')"
      @toggleReview="toggleModal('reviewModal')"
      @toggleNotImplemented="toggleModal('notImplementedModal')"
    >
    </NavBar>

    <!-- this is a cheesy way of mimicking the expanding squares that appear as a file is loading -->
    <div class="loadingSquare" v-if="isLoadingSquareVisible" :style="loadingSquareStyle"></div>

    <DraggableModal
      modalClass="welcome"
      title="Welcome! How did you get here?"
      :isVisible="isModalVisible.welcomeModal"
      :bounds="bounds"
      :style="{ zIndex: getZIndex('welcomeModal') }"
      @close="toggleModal('welcomeModal')"
      @click="setNewZIndex('welcomeModal')"
    >
      <div
        style="font-size: 20px; padding: 9px; overflow-y: auto; max-width: 100%; max-height: 100%"
      >
        Whether the year is 1986 and you saved up all your summer-job money to buy this thing 'new',
        or just pulled some dusty computer parts out of a sleepy Goodwill in the sticks and taped it
        all together, welcome! Pardon the glitches, my motherboard's seen better days. :]
        <br /><br />
        Why not play around with my features? All my popups move around the screen. It's so much fun
        to make them dance around! In my topward bar, you can open new windows and interact with my
        systems as much as you want. There might even be some games up there! Not right now, but one
        day..
        <br /><br />
        Have fun and enjoy! If you're here, just know I love you!!
      </div>
    </DraggableModal>

    <DraggableModal
      modalClass="review"
      title="Review"
      :isVisible="isModalVisible.reviewModal"
      :bounds="bounds"
      :style="{ zIndex: getZIndex('reviewModal') }"
      @close="toggleModal('reviewModal')"
      @click="setNewZIndex('reviewModal')"
    >
    <div
  style="font-size: 20px; padding: 9px; overflow-y: auto; max-width: 100%; max-height: 100%; display: flex; flex-direction: column; height: 100%;"
    >
      <h2>Leave a review!</h2>
      <p>Make sure you're nice!!  Full disclosure, this form doesn't submit anywhere.. 
        I haven't configured it yet.  You're better off just emailing or texting me with any issues.  
        Thanks :D
      </p>
      <textarea
        id="textInput"
        placeholder="Type here..."
        style="width: 100%; flex: 1; box-sizing: border-box; 
        font-family: 'Chicago', 'sans-serif'; font-size:20px;"
      ></textarea>
      <button style="font-family: 'Chicago', 'sans-serif'; font-size:20px;">submit!!</button>
</div>
    </DraggableModal>

    <DraggableModal
      modalClass="notImplemented"
      title="Oops!  This isn't implemented yet"
      :isVisible="isModalVisible.notImplementedModal"
      :bounds="bounds"
      :style="{ zIndex: getZIndex('notImplementedModal') }"
      @close="toggleModal('notImplementedModal')"
      @click="setNewZIndex('notImplementedModal')"
    >
      <iframe :src="DoesNotExist" style="width: 100%; height: 100%"> nothing here lol</iframe>
    </DraggableModal>

    <DraggableModal
      modalClass="contact"
      title="Contact Me!"
      :isVisible="isModalVisible.contactModal"
      :bounds="bounds"
      :style="{ zIndex: getZIndex('contactModal') }"
      @close="toggleModal('contactModal')"
      @click="setNewZIndex('contactModal')"
    >
      <div
        style="font-size: 20px; padding: 7px; overflow-y: auto; max-width: 100%; max-height: 100%"
      >
        <p>
          Oh hi! You want to get in touch with me (Duncan)? I love the sound of that! Here are a
          couple of the best ways to contact me:
        </p>
        <ul>
          <li>Email: mayer.du@northeastern.edu</li>
          <li>Phone: 978-818-3526</li>
          <li>
            Smoke Signal: On the 3rd day after a new moon, atop Boston's Fort Hill, release 3 smoke
            clouds. I'll see.
          </li>
          <li>Come To My House: we could hang out and watch videos together</li>
        </ul>
      </div>
    </DraggableModal>

    <DesktopFile :bounds="bounds" fileName="DuncanResume.pdf" @openFile="toggleFile('resumeModal')">
    </DesktopFile>

    <FileDisplay
      modalClass="resume"
      title="My Resume"
      :bounds="bounds"
      :isVisible="isModalVisible.resumeModal"
      :style="{ zIndex: getZIndex('resumeModal') }"
      @close="toggleFile('resumeModal')"
      @click="setNewZIndex('resumeModal')"
    >
      <iframe
        src="/files/Duncan_Mayer_Resume.pdf#toolbar=0&view=FitH"
        style="
          font-size: 25px;
          overflow-y: auto;
          width: 100%;
          height: 100%;
          margin: 0;
          border: none;
        "
      >
      </iframe>
    </FileDisplay>
  </div>
</template>

<script setup lang="js">
import { onBeforeMount, ref } from 'vue'
import NavBar from './components/NavBar.vue'
import DraggableModal from './components/DraggableModal.vue'
import FileDisplay from './components/FileDisplay.vue'
import DesktopFile from './components/DesktopFile.vue'
import DoesNotExist from './assets/icons/sad_finder.png'

let isModalVisible = ref({
  welcomeModal: true,
  contactModal: true,
  reviewModal: false,
  resumeModal: false,
  notImplementedModal: false
})
let modalZIndices = ref({
  welcomeModal: 2,
  contactModal: 1,
  reviewModal: 1,
  resumeModal: 1,
  notImplementedModal: 1
})
let bounds = ref({ width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0 })
let isInFile = ref(false)

let isLoadingSquareVisible = ref(false)
let loadingSquareStyle = ref({})

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
  }
}

const toggleModal = (modalType) => {
  isModalVisible.value[modalType] = !isModalVisible.value[modalType]
  if (isModalVisible.value[modalType]) {
    setNewZIndex(modalType)
  } else {
    modalZIndices.value[modalType] = 0
  }
}

const toggleFile = (file) => {
  // if you are opening the file, draw the animation
  // of the expanding box
  if (!isInFile.value) {
    drawLoadingSquare()
    setTimeout(() => {
      isInFile.value = !isInFile.value
      toggleModal(file)
    }, 700)
  } // don't render animation on closing file
  else {
    isInFile.value = !isInFile.value
    toggleModal(file)
  }
}

const getZIndex = (modalType) => {
  return modalZIndices.value[modalType]
}

const setNewZIndex = (modalType) => {
  const maxZIndex = Math.max(...Object.values(modalZIndices.value), 0)
  modalZIndices.value[modalType] = maxZIndex + 1
}

const drawLoadingSquare = () => {
  let baseSize = 50
  let numIterations = 10
  isLoadingSquareVisible.value = true
  loadingSquareStyle.value = {
    width: `${baseSize}px`,
    height: `${baseSize}px`,
    backgroundColor: 'transparent',
    border: `5px solid black`,
    position: 'absolute',
    top: `${40 + baseSize / 2}px`,
    left: `${20 + baseSize / 2}px`,
    zIndex: 1000
  }
  for (let i = 1; i < numIterations; i++) {
    // this is TEMPORARY until i can figure out an equation for it
    // make this so that it's based off of File Icon's location.
    let tops = [30, 70, 90, 120, 140, 150, 150, 150, 150]
    let lefts = [70, 85, 100, 125, 150, 195, 230, 240, 250]
    setTimeout(() => {
      loadingSquareStyle.value = {
        // these size increases can stay constant but i want top and left to curve instead of linearly increase
        // width: `${50 * 1.2 ** i + 2 * baseSize}px`,
        width: `${Math.min(50 * (i - 1) + baseSize, bounds.value.width - 125)}px`,
        // height: `${35 * 1.2 ** i + 2 * baseSize}px`,
        height: `${Math.min(35 * (i - 1) + baseSize, bounds.value.height - 100)}px`,
        backgroundColor: 'transparent',
        border: `5px solid black`,
        position: 'absolute',
        top: `${tops[i] * (bounds.value.height / 550)}px`,
        left: `${lefts[i] * (bounds.value.width / 1000)}px`,
        zIndex: 1000
      }

      if (i === numIterations - 1) {
        setTimeout(() => {
          isLoadingSquareVisible.value = false
        }, 100)
      }
    }, 50 * i)
  }
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
