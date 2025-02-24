<template>
  <div class="app-container" >
    <router-view />
  </div>
</template>

<script>
export default {
  name: "App",
};
</script>

<style>

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}


html, body {
  height: 100%;
  width: 100%;
  overflow: hidden;
  background-color: #1a1a1a; 
  display: flex;
}


.app-container {
  flex-grow: 1;
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}
</style>
