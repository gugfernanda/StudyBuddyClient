<script>

export default {
    name: "NavBar",
};

</script>

<template>
   <header class="navbar">
        <div class="title">Study Buddy</div>
        <div class="user-actions">
            <input type="text" placeholder="Search..." class="search-bar">
            <div class="icons-container">
                <button class="icon-button">
                    <span class="mdi mdi-bell"></span>
                </button>
                <button class="icon-button">
                    <span class="mdi mdi-account"></span>
                </button>
            </div>
        </div>
    </header>
</template>

<style scoped>

.navbar {
    background-color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}

.title {
    font-size: 20px;
    font-weight: bold;
    color: #002241;
}

/* Container pentru aliniere corectă */
.user-actions {
    display: flex;
    align-items: center;
    gap: 10px; /* Face iconițele să fie mai apropiate de search bar */
}

/* Ajustare dimensiune search bar */
.search-bar {
    padding: 8px 12px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 14px;
    width: 250px;
}

/* Iconitele să fie mai apropiate între ele */
.icons-container {
    display: flex;
    align-items: center;
    gap: 5px; /* Distanță redusă între iconițe */
}

/* Ajustare dimensiune și padding iconițe */
.icon-button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 22px;
    padding: 5px;
    color: #002241;
}

.icon-button:hover {
    color: #e91ea5;
}

</style>