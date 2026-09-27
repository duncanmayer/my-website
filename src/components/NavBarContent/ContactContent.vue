<script setup>
import { ref } from 'vue';

const textInput = ref('');
</script>

<template>
  <div style="font-size: 20px; padding: 7px; overflow-y: auto; max-width: 100%; max-height: 100%">
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
</template>