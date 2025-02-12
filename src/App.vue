<template>
  <div>
    <nav>
      <router-link to="/users">Lista Utilizatorilor</router-link>
    </nav>
    <router-view />
  </div>
</template>

<script>
export default {
  name: "App",
};
</script>

<style scoped>
nav {
  background: #333;
  padding: 10px;
}

nav a {
  color: white;
  margin-right: 10px;
  text-decoration: none;
}
</style>
