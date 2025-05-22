<script>
import UserService from '../services/UserService.js'
import { translations } from "../translations.js";
import { useLanguage } from "../language.js";
import { ref, computed } from 'vue'

export default {
    name: 'AccountSettingsModal',
    props: {
        userId: {
            type: Number,
            required: true
        }
    },

    setup() {
      const { lang, setLang } = useLanguage();
      const t = computed(() => translations[lang.value]);
      return { lang, setLang, t };
    },

    data() {
        return {
            form: {
                username: '',
                oldPassword: '',
                newPassword: '',
                fullName: '',
                email: '',
            },
            original: {},
            editing: {
                username: false,
                fullName: false,
                email: false
            },
            passwordOpen: false,
            passwordError: null,
            showOldPassword: false,
            showNewPassword: false,
        };
    },


    computed: {

        fields() {
            return [
                { name: 'fullName', label: 'Full Name', editing: this.editing.fullName },
                { name: 'username', label: 'Username', editing: this.editing.username },
                { name: 'email', label: 'Email', editing: this.editing.email }
            ];
        },
    },

    async mounted() {
        try {
            const dto = await UserService.getUser(this.userId);
            // console.log('User DTO:', dto);
            this.form.username = dto.username;
            this.form.fullName = dto.full_name;
            this.form.email = dto.email;
            this.original = { ...this.form };
        } catch (error) {
            console.error('Failed to load user data:', error);
        }
    },

    methods: {
        close() {
            this.$emit('close');
        },
        startEdit(field) {
            this.editing[field] = true;
        },
        cancelEdit(field) {
            this.form[field] = this.original[field];
            this.editing[field] = false;
        },
        saveField(field) {
            this.original[field] = this.form[field];
            this.editing[field] = false;
        },
        switchLang(code) {
          this.setLang(code);
        },
        togglePassword() {
            this.passwordOpen = !this.passwordOpen;
        },
        validatePassword() {
            const pwd = this.form.newPassword;
            const minLength = 8;
            const specialChar = /[!@#$%^&*(),.?":{}|<>]/;
            const uppercase = /[A-Z]/;
            const digit = /\d/;

            if (pwd.length < minLength) {
            this.passwordError = `Password must be at least ${minLength} characters`;
            } else if (!specialChar.test(pwd)) {
            this.passwordError = 'Password must contain at least one special character';
            } else if (!uppercase.test(pwd)) {
            this.passwordError = 'Password must contain at least one uppercase letter';
            } else if (!digit.test(pwd)) {
            this.passwordError = 'Password must contain at least one digit';
            } else {
            this.passwordError = null;
            }
        },

        toggleOldPassword() {
            this.showOldPassword = !this.showOldPassword;
        },
        toggleNewPassword() {
            this.showNewPassword = !this.showNewPassword;
        },

        async saveChanges() {
            const payload = {};
            ['username','fullName','email'].forEach(f => {
                if (this.original[f] !== this.form[f]) payload[f] = this.form[f];
            });
            if (this.passwordOpen && this.form.newPassword) {
                payload.oldPassword = this.form.oldPassword;
                payload.newPassword = this.form.newPassword;
            }
            try {
                await UserService.updateUser(this.userId, payload);
                this.$emit('updated');
                this.close();
            } catch (err) {
                alert(err.response?.data?.message || 'Update failed');
            }
        }
    }
}
</script>

<template>
  <div class="modal-backdrop" @click.self="close">
    <div class="modal">
      <header class="modal-header">
        <h3>{{ t.updateProfile }}</h3>

         <div class="lang-switch">
          <button
            :class="{ active: lang === 'ro' }"
            @click="switchLang('ro')"
          >RO</button>
          <button
            :class="{ active: lang === 'en' }"
            @click="switchLang('en')"
          >EN</button>
        </div>

        <!-- <button class="close-btn" @click="close">&times;</button> -->
      </header>
      <section class="modal-body">

        
        <div class="profile-field">
          <label for="fullName">{{ t.fullName }}</label>
          <span v-if="!editing.fullName" class="field-value">{{ form.fullName }}</span>
          <button v-if="!editing.fullName" class="edit-btn" @click="startEdit('fullName')">
            <i class="mdi mdi-pencil"></i>
          </button>
          <div v-else class="field-edit">
            <input id="fullName" v-model="form.fullName" />
            <button class="save-btn" @click="saveField('fullName')"><i class="mdi mdi-check"></i></button>
            <button class="cancel-btn" @click="cancelEdit('fullName')"><i class="mdi mdi-close"></i></button>
          </div>
        </div>

        <!-- Username -->
        <div class="profile-field">
          <label for="username">{{ t.username }}</label>
          <span v-if="!editing.username" class="field-value">{{ form.username }}</span>
          <button v-if="!editing.username" class="edit-btn" @click="startEdit('username')">
            <i class="mdi mdi-pencil"></i>
          </button>
          <div v-else class="field-edit">
            <input id="username" v-model="form.username" />
            <button class="save-btn" @click="saveField('username')"><i class="mdi mdi-check"></i></button>
            <button class="cancel-btn" @click="cancelEdit('username')"><i class="mdi mdi-close"></i></button>
          </div>
        </div>

        <!-- Email -->
        <div class="profile-field">
          <label for="email">{{ t.email }}</label>
          <span v-if="!editing.email" class="field-value">{{ form.email }}</span>
          <button v-if="!editing.email" class="edit-btn" @click="startEdit('email')">
            <i class="mdi mdi-pencil"></i>
          </button>
          <div v-else class="field-edit">
            <input id="email" v-model="form.email" />
            <button class="save-btn" @click="saveField('email')"><i class="mdi mdi-check"></i></button>
            <button class="cancel-btn" @click="cancelEdit('email')"><i class="mdi mdi-close"></i></button>
          </div>
        </div>

        <!-- Password Section -->
      <div class="password-section">
        <div class="password-header" @click="togglePassword">
          <i class="mdi" :class="passwordOpen ? 'mdi-chevron-down' : 'mdi-chevron-right'"></i>
          <span>{{ t.changePassword }}</span>
        </div>
      <div v-if="passwordOpen" class="password-fields">

    <!-- Current Password -->
    <div class="form-group pw-group">
      <label for="oldPassword">{{ t.currentPassword }}</label>
      <div class="pw-wrapper">
        <input
          id="oldPassword"
          class="pw-input"
          :type="showOldPassword ? 'text' : 'password'"
          v-model="form.oldPassword"
        />
        <button type="button" class="pw-toggle" @click="toggleOldPassword">
          <i class="mdi" :class="showOldPassword ? 'mdi-eye-off' : 'mdi-eye'"></i>
        </button>
      </div>
    </div>

    <!-- New Password -->
    <div class="form-group pw-group">
      <label for="newPassword">{{ t.newPassword }}</label>
      <div class="pw-wrapper">
        <input
          id="newPassword"
          class="pw-input"
          :type="showNewPassword ? 'text' : 'password'"
          v-model="form.newPassword"
          @input="validatePassword"
        />
        <button type="button" class="pw-toggle" @click="toggleNewPassword">
          <i class="mdi" :class="showNewPassword ? 'mdi-eye-off' : 'mdi-eye'"></i>
        </button>
      </div>
      <small v-if="passwordError" class="error">{{ passwordError }}</small>
    </div>

  </div>
</div>


        <!-- Actions -->
        <div class="form-actions">
          <button type="button" class="btn-save" @click="saveChanges" :disabled="passwordError">{{ t.saveAll }}</button>
          <button type="button" class="btn-cancel" @click="close">{{ t.cancel }}</button>
        </div>

      </section>
    </div>
  </div>
</template>





<style scoped>

.btn-save {
  background: #e91ea5;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
}
.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-save:not(:disabled):hover {
  background: #d11691;
}

.btn-cancel {
   background: #002241;        /* albastru Study Buddy */
  color: #ffffff;             /* text alb pentru contrast */
  border: none;               /* fără bordură */
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: 0.2s;
}
.btn-cancel:hover {
  background: #001a35;
}

.lang-switch {
  display: inline-flex;
  gap: 0.25rem;
  margin-left: auto; 
}


.lang-switch button {
  background: #f5f5f5;      
  color: #333;              
  border: 1px solid #ccc;  
  border-radius: 3px;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  transition: 0.2s;
}

.lang-switch button:not(.active):hover {
  background: #eaeaea;    
}


.lang-switch button.active {
  background: #e91ea5;       
  color: #fff;              
  border-color: #e91ea5;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.modal-header {
  padding: 12px 16px;
  text-align: center;
  position: relative;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
}

.close-btn {
  position: absolute;
  top: 12px;
  right: 16px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #002241;
}

.modal-body {
  padding: 16px;
}

.value-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.value-row span {
  white-space: nowrap;
}

.profile-field {
  display: grid;
  grid-template-columns: 1fr 40px;
  /* grid-template-rows: auto auto; */
  row-gap: 4px;
  align-items: center;
  margin-bottom: 14px;
}

.profile-field label {
  grid-column: 1 / -1;
  /* margin-bottom: 4px; */
  font-weight: 500;
}

.field-value {
  grid-column: 1 / 2;
}

.field-value span {
  white-space: normal;
  overflow: visible;
  text-overflow: unset;
}

.edit-btn {
  grid-column: 2 / 3;
  justify-self: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
}

.field-edit {
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 8px;
}

.field-edit input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.edit-btn,
.save-btn,
.cancel-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
}

.edit-btn i,
.save-btn i,
.cancel-btn i {
  color: #002241;
}

.edit-btn:hover i,
.save-btn:hover i,
.cancel-btn:hover i {
  color: #e91ea5;
}


.password-section {
  margin-top: 16px;
}

.password-header {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 8px;
  font-weight: 500;
}

.password-fields {
  margin-top: 8px;
}

.form-group {
  margin-bottom: 12px;
}

.form-group label {
  display: block;
  margin-bottom: 4px;
}

.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}

.form-actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.pw-wrapper {
  display: flex;
  width: 100%;           /* ocupă tot spațiul disponibil */
  align-items: center;
}

.pw-input {
  flex: 1;               /* ia tot spațiul rămas */
  padding: 12px 16px;    /* blocul text mai mare */
  font-size: 1rem;       /* text mai mare */
  border: 1px solid #ccc;
  border-radius: 4px 0 0 4px;
  box-sizing: border-box;
}

.pw-toggle {
  flex: 0 0 auto;        /* bloc fix pentru ochi */
  width: 2rem;           /* lățime mai mică */
  height: 2rem;          /* înălțime fixă */
  margin-left: 5px;     /* să se lipească de input */
  border: 1px solid #ccc;
  border-radius: 0 4px 4px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  cursor: pointer;
}


.pw-toggle i {
  font-size: 1.2rem;
  color: #002241;
}



.error {
  color: red;
  font-size: 12px;
}

</style>
