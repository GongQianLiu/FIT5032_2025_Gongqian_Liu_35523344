<template>
  <div class="login-page">
    <div class="background-container">
      <div class="overlay"></div>
    </div>
    <div class="auth-container">
      <div class="auth-card-wrapper">
        <div class="card-header text-white text-center py-4">
          <h1 class="display-4 fw-bold mb-0">Evergreen Way</h1>
          <p class="mb-0 mt-2 fs-3">Sign In</p>
        </div>
        <div class="card-body p-4 p-md-5">
          <form @submit.prevent="handleLogin">
            <div class="mb-4">
              <div class="input-group input-group-lg">
                <span class="input-group-text bg-light border-end-0">
                  <i class="bi bi-person-fill fs-3"></i>
                </span>
                <input
                  type="email"
                  class="form-control form-control-lg border-start-0 py-3 fs-5"
                  :class="{ 'is-invalid': v$.username.$error }"
                  id="username"
                  v-model="formData.username"
                  placeholder="Enter email"
                  required
                  :disabled="isLoading"
                  autocomplete="email"
                  @blur="v$.username.$touch()"
                  oninvalid="this.setCustomValidity('Please enter your email')"
                  oninput="this.setCustomValidity('')"
                />
              </div>
              <div class="invalid-feedback d-block" v-if="v$.username.$error">
                {{ v$.username.$errors[0].$message }}
              </div>
            </div>
            <div class="mb-5">
              <div class="input-group input-group-lg">
                <span class="input-group-text bg-light border-end-0">
                  <i class="bi bi-lock-fill fs-3"></i>
                </span>
                <input
                  type="password"
                  class="form-control form-control-lg border-start-0 py-3 fs-5"
                  :class="{ 'is-invalid': v$.password.$error }"
                  id="password"
                  v-model="formData.password"
                  placeholder="Enter password"
                  required
                  :disabled="isLoading"
                  autocomplete="current-password"
                  @blur="v$.password.$touch()"
                  oninvalid="this.setCustomValidity('Please enter your password')"
                  oninput="this.setCustomValidity('')"
                />
              </div>
              <div class="invalid-feedback d-block" v-if="v$.password.$error">
                {{ v$.password.$errors[0].$message }}
              </div>
            </div>
            <div class="d-grid gap-2 mb-4">
              <button 
                type="submit" 
                class="btn btn-primary btn-lg py-3 fs-4"
                :disabled="isLoading"
              >
                <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                <i v-else class="bi bi-box-arrow-in-right me-2"></i>
                {{ isLoading ? 'Signing in...' : 'Sign In' }}
              </button>
            </div>
            <div class="text-center">
              <router-link to="/register" class="text-decoration-none fs-4" :tabindex="isLoading ? -1 : 0">
                <i class="bi bi-person-plus-fill me-1"></i>
                New user? Register here
              </router-link>
            </div>
            <div class="text-center mt-4 text-muted">
              <small>Please register first to create an account</small>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useVuelidate } from '@vuelidate/core'
import { required, helpers } from '@vuelidate/validators'
import firebaseAuth from '../services/firebaseAuth'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const toast = useToast()
    const formData = ref({
      username: '',
      password: ''
    })
    const isLoading = ref(false)

    const rules = {
      username: { required: helpers.withMessage('Email is required', required) },
      password: { required: helpers.withMessage('Password is required', required) }
    }

    const v$ = useVuelidate(rules, formData)

    const handleLogin = async () => {
      const isFormCorrect = await v$.value.$validate()
      if (!isFormCorrect) {
        toast.error("Please fill in all required fields", {
          timeout: 2000
        })
        return
      }

      try {
        isLoading.value = true
        const user = await firebaseAuth.login(formData.value.username, formData.value.password)
        console.log('Login response:', user)
        
        // Store user information
        const userToStore = {
          ...user,
          id: user.id
        }
        console.log('Storing user:', userToStore)
        localStorage.setItem('currentUser', JSON.stringify(userToStore))
        
        toast.success("Login successful!", {
          timeout: 1500
        })

        // Navigate based on user role to home page
        let route;
        if (user.role === 'volunteer') {
          route = '/volunteer-home';
        } else if (user.role === 'admin') {
          route = '/admin-home';
        } else {
          route = '/elderly-home';
        }
        console.log('Navigating to:', route)
        await router.push(route)
        
        // Clear form data
        formData.value = { username: '', password: '' }
      } catch (error) {
        console.error('Login error:', error)
        toast.error(error.message || "Login failed. Please try again.", {
          timeout: 2000
        })
      } finally {
        isLoading.value = false
      }
    }

    return {
      formData,
      v$,
      isLoading,
      handleLogin
    }
  }
}
</script>

<style scoped>
/*
  Final Stable Version:
  Applying the same stable styles as Register.vue.
  Permanently removed performance-intensive properties like `backdrop-filter`
  and interactive transforms/animations to guarantee stability.
*/
.login-page {
  min-height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.background-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('/src/assets/images/EbBmoVDxYK.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 1;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.1);
  z-index: 2;
}

.auth-container {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.4);
  padding: 2rem;
  z-index: 3;
  box-shadow: 
    inset 0 0 50px rgba(0, 0, 0, 0.1),
    0 0 15px rgba(0, 0, 0, 0.2);
  border-left: 1px solid rgba(255, 255, 255, 0.5);
  border-right: 1px solid rgba(255, 255, 255, 0.5);
}

.auth-card-wrapper {
  width: 100%;
  max-width: 800px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  box-shadow: 
    0 10px 30px rgba(0, 0, 0, 0.1),
    0 1px 8px rgba(0, 0, 0, 0.2);
  margin: 0 auto;
}

.card-header {
  background: linear-gradient(135deg, #B87E5F 0%, #DEB19F 100%);
  color: white;
  border-radius: 20px 20px 0 0;
  border: none;
  padding: 2rem;
  text-align: center;
}

.card-header h1 {
  margin: 0;
  font-size: 3rem;
  font-weight: 600;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.card-header p {
  margin: 1rem 0 0;
  font-size: 1.5rem;
  opacity: 0.9;
}

.card-body {
  padding: 3rem;
}

.input-group {
  margin-bottom: 2rem;
}

.input-group-text {
  border: none;
  background: rgba(107, 115, 255, 0.1);
  padding: 0.75rem 1.25rem;
  color: #6B73FF;
}

.form-control {
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  font-size: 16px;
  transition: border-color 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
}

.form-control:focus {
  border-color: #B87E5F;
  background: rgba(255, 255, 255, 0.95);
}

.btn-primary {
  background: linear-gradient(135deg, #B87E5F 0%, #DEB19F 100%);
  border: none;
  border-radius: 12px;
  padding: 1rem;
  font-size: 1.25rem;
  font-weight: 600;
  transition: background-color 0.3s ease;
  width: 100%;
}

.btn-primary:disabled {
  background: #6c757d;
}

.text-decoration-none {
  color: #6B73FF;
  transition: color 0.3s ease;
  position: relative;
  font-size: 1.1rem;
  display: block;
  text-align: center;
  margin-top: 1.5rem;
}

.text-decoration-none::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: #000DFF;
  transition: width 0.3s ease;
}

.text-decoration-none:hover::after {
  width: 100%;
}

.text-center {
  text-align: center;
}

.text-muted {
  color: #6c757d;
  font-size: 0.9rem;
  margin-top: 2rem;
}

.invalid-feedback {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #dc3545;
}
</style> 
 