<template>
  <div class="app-container">
    <router-view />
  </div>
</template>

<script>
export default {
  name: "App",
};
</script>

<style>
/* Elimină orice margine sau padding global */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Elimină orice spațiu alb în jurul aplicației */
html, body {
  height: 100%;
  width: 100%;
  overflow: hidden;
  background-color: #1a1a1a; /* Asigură că nu se vede fundal alb */
}

/* Asigură că aplicația ocupă TOT ecranul */
.app-container {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  display: flex;
}
</style>
