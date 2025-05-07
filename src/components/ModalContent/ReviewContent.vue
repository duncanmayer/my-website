<script setup>
import { ref } from 'vue';

const textInput = ref('');
</script>

<template>
  <div
    style="font-size: 20px; padding: 9px; overflow-y: auto; max-width: 100%; max-height: 100%; display: flex; flex-direction: column; height: 100%;"
  >
    <h2>Leave a review!</h2>
    <p>
      Make sure you're nice!! Full disclosure, this form doesn't submit anywhere..
      I haven't configured it yet. You're better off just emailing or texting me with any issues.
      Thanks :D
    </p>
    <textarea
      v-model="textInput"
      placeholder="Type here..."
      style="width: 100%; flex: 1; box-sizing: border-box; font-family: 'Chicago', 'sans-serif'; font-size: 20px;"
    ></textarea>
    <button style="font-family: 'Chicago', 'sans-serif'; font-size: 20px;">submit!!</button>
  </div>
</template>