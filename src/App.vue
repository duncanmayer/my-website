<template>
  <div class="app">
    <NavBar class="navBar" :isInFile="isInFile" @toggleWelcome="toggleDialog('welcomeDialog')"
      @toggleContact="toggleDialog('contactDialog')" @toggleReview="toggleDialog('reviewDialog')"
      @togglePaint="toggleDialog('paintDialog')"
      @toggleNotImplemented="toggleDialog('notImplementedDialog')">
    </NavBar>

    <!-- this is a cheesy way of mimicking the expanding squares that appear as a file is loading -->
    <div class="loadingSquare" v-if="isLoadingSquareVisible" :style="loadingSquareStyle"></div>

    <DraggableDialog dialogClass="welcome" title="Welcome! How did you get here?" :isVisible="isDialogVisible.welcomeDialog"
      :bounds="bounds" :style="{ zIndex: getZIndex('welcomeDialog') }" @close="toggleDialog('welcomeDialog')"
      @click="setNewZIndex('welcomeDialog')">
      <WelcomeContent />
    </DraggableDialog>

    <DraggableDialog dialogClass="review" title="Review" :isVisible="isDialogVisible.reviewDialog" :bounds="bounds"
      :style="{ zIndex: getZIndex('reviewDialog') }" @close="toggleDialog('reviewDialog')"
      @click="setNewZIndex('reviewDialog')">
      <ReviewContent />
    </DraggableDialog>

    <DraggableDialog dialogClass="notImplemented" title="Oops!  This isn't implemented yet"
      :isVisible="isDialogVisible.notImplementedDialog" :bounds="bounds"
      :style="{ zIndex: getZIndex('notImplementedDialog') }" @close="toggleDialog('notImplementedDialog')"
      @click="setNewZIndex('notImplementedDialog')">
      <iframe :src="DoesNotExist" style="width: 100%; height: 100%"> nothing here lol</iframe>
    </DraggableDialog>

    <DraggableDialog dialogClass="contact" title="Contact Me!" :isVisible="isDialogVisible.contactDialog" :bounds="bounds"
      :style="{ zIndex: getZIndex('contactDialog') }" @close="toggleDialog('contactDialog')"
      @click="setNewZIndex('contactDialog')">
      <ContactContent />
    </DraggableDialog>

    <DesktopFileIcon :bounds="bounds" fileName="DuncanResume.pdf" @openFile="toggleFile('resumeDialog')">
    </DesktopFileIcon>

    <FileDisplay dialogClass="resume" title="My Resume" :bounds="bounds" :isVisible="isDialogVisible.resumeDialog"
      :style="{ zIndex: getZIndex('resumeDialog') }" @close="toggleFile('resumeDialog')"
      @click="setNewZIndex('resumeDialog')">
      <iframe src="/files/Duncan_Mayer_Resume.pdf#toolbar=0&view=FitH" style="
          font-size: 25px;
          overflow-y: auto;
          width: 100%;
          height: 100%;
          margin: 0;
          border: none;
        ">
      </iframe>
    </FileDisplay>

    <DraggableDialog dialogClass="paint" title="Paint Tool" :isVisible="isDialogVisible.paintDialog" :bounds="bounds"
      :style="{ zIndex: getZIndex('paintDialog') }" @close="toggleDialog('paintDialog')"
      @click="setNewZIndex('paintDialog')">
      <div>
        <h2>blah</h2>
      </div>
    </DraggableDialog>
  </div>
</template>

<script setup lang="js">
import { onBeforeMount, ref } from 'vue'
import NavBar from './components/NavBar.vue'
import DraggableDialog from './components/DraggableDialog.vue'
import FileDisplay from './components/DesktopContent/FullScreenFileViewer.vue'
import DesktopFileIcon from './components/DesktopContent/DesktopFileIcon.vue'
import DoesNotExist from './assets/icons/sad_finder.png'
import ReviewContent from './components/NavBarContent/ReviewContent.vue'
import ContactContent from './components/NavBarContent/ContactContent.vue'
import WelcomeContent from './components/NavBarContent/WelcomeContent.vue'

let isDialogVisible = ref({
  welcomeDialog: true,
  contactDialog: true,
  reviewDialog: false,
  resumeDialog: false,
  notImplementedDialog: false,
  paintDialog: false,
})
let dialogZIndices = ref({
  welcomeDialog: 2,
  contactDialog: 1,
  reviewDialog: 1,
  resumeDialog: 1,
  notImplementedDialog: 1,
  paintDialog: 1,
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

const toggleDialog = (dialogType) => {
  isDialogVisible.value[dialogType] = !isDialogVisible.value[dialogType]
  if (isDialogVisible.value[dialogType]) {
    setNewZIndex(dialogType)
    console.log(`setting new z index for ${dialogType}`)
  } else {
    dialogZIndices.value[dialogType] = 0
  }
}

const toggleFile = (file) => {
  // if you are opening the file, draw the animation
  // of the expanding box
  if (!isInFile.value) {
    drawLoadingSquare()
    setTimeout(() => {
      isInFile.value = !isInFile.value
      toggleDialog(file)
    }, 700)
  } // don't render animation on closing file
  else {
    isInFile.value = !isInFile.value
    toggleDialog(file)
  }
}

const getZIndex = (dialogType) => {
  return dialogZIndices.value[dialogType]
}

const setNewZIndex = (dialogType) => {
  const maxZIndex = Math.max(...Object.values(dialogZIndices.value), 0)
  dialogZIndices.value[dialogType] = maxZIndex + 1
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
