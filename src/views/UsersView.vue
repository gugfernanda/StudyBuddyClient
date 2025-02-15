<script>
import UserService from "../services/UserService.js";



export default {
  data() {
      return {
          users: [], //stores the list of users
          newUser: { username: "", full_name: "", email: "", password: "" } //form data for adding new user test
      };
  },

  async created() {
      await this.fetchUsers();  //load users when the component is created
  },

  methods: {
      async fetchUsers() {
          try {
              this.users = await UserService.getAllUsers();
          } catch (error) {
              console.error("Error fetching users:", error);
          }
      },

      async addUser() {
          try {
              await UserService.createUser(this.newUser);
              this.newUser = { username: "", full_name: "", email: "", password: "" }; //reset form
              await this.fetchUsers();  //refresh user list
          } catch (error) {
              console.error("Error adding user:", error);
          }
      },

      async deleteUser(id) {
          try {
              await UserService.deleteUser(id);
              await this.fetchUsers();  //refresh user list after deletion
          } catch (error) {
              console.error("Error deleting user:", error);
          }
      }
  }
};
</script>



<template>
    <div class="container">
        <h1>User List</h1>

        <ul v-if = "users.length">
            <li v-for = "user in users" :key = "user.id">
                {{ user.full_name }} ({{ user.username }}) - {{ user.email }}
                <button @click = "deleteUser(user.id)">Delete</button>

            </li>
        </ul>
        <p v-else>No users found.</p>


        <h2>Add User</h2>
        <form @submit.prevent = "addUser">
            <input v-model = "newUser.username" placeholder = "Username" required />
            <input v-model = "newUser.full_name" placeholder = "Full Name" required/>
            <input v-model = "newUser.email" placeholder = "Email" required/>
            <input v-model = "newUser.password" type = "password" placeholder = "Password" required />
            <button type = "submit">Add</button>
        </form>


    </div>
  </template>
  

<style scoped>

.container {
    max-width: 600px;
    margin: auto;
    text-align: center;
}

button {
    margin-left: 10px;
    cursor: pointer;
}

</style>
  