<template>
  <div class="register-page">
    <div class="background-container">
      <div class="overlay"></div>
    </div>
    <div class="auth-container">
      <div class="auth-card-wrapper">
        <div class="card-header text-white text-center py-4">
          <h1 class="display-4 fw-bold mb-0">Evergreen Way</h1>
          <p class="mb-0 mt-2 fs-3">Register</p>
        </div>
        <div class="card-body p-4 p-md-5">
          <form @submit.prevent="handleRegister">
            <div class="mb-4">
              <div class="input-group input-group-lg">
                <span class="input-group-text bg-light border-end-0">
                  <i class="bi bi-envelope-fill fs-3"></i>
                </span>
                <input
                  type="email"
                  class="form-control form-control-lg border-start-0 py-3 fs-5"
                  :class="{ 'is-invalid': v$.formData.email.$error && fieldsTouched.email }"
                  id="email"
                  v-model="formData.email"
                  placeholder="Enter email"
                  required
                  :disabled="isLoading"
                  @blur="handleFieldBlur('email')"
                  oninvalid="this.setCustomValidity('Please enter a valid email')"
                  oninput="this.setCustomValidity('')"
                />
              </div>
              <div class="invalid-feedback d-block" v-if="v$.formData.email.$error && fieldsTouched.email">
                {{ v$.formData.email.$errors[0].$message }}
              </div>
            </div>
            <div class="mb-4">
              <div class="input-group input-group-lg">
                <span class="input-group-text bg-light border-end-0">
                  <i class="bi bi-person-fill fs-3"></i>
                </span>
                <input
                  type="text"
                  class="form-control form-control-lg border-start-0 py-3 fs-5"
                  :class="{ 'is-invalid': v$.formData.username.$error && fieldsTouched.username }"
                  id="username"
                  v-model="formData.username"
                  placeholder="Enter username"
                  required
                  :disabled="isLoading"
                  @blur="handleFieldBlur('username')"
                  oninvalid="this.setCustomValidity('Please enter a username')"
                  oninput="this.setCustomValidity('')"
                />
              </div>
              <div class="invalid-feedback d-block" v-if="v$.formData.username.$error && fieldsTouched.username">
                {{ v$.formData.username.$errors[0].$message }}
              </div>
              <small class="text-muted">Username must be 3-20 characters long and contain only letters, numbers, and underscores.</small>
            </div>
            <div class="mb-4">
              <div class="input-group input-group-lg">
                <span class="input-group-text bg-light border-end-0">
                  <i class="bi bi-lock-fill fs-3"></i>
                </span>
                <input
                  type="password"
                  class="form-control form-control-lg border-start-0 py-3 fs-5"
                  :class="{ 'is-invalid': v$.formData.password.$error && fieldsTouched.password }"
                  id="password"
                  v-model="formData.password"
                  placeholder="Enter password"
                  required
                  :disabled="isLoading"
                  @blur="handleFieldBlur('password')"
                  oninvalid="this.setCustomValidity('Please enter a password')"
                  oninput="this.setCustomValidity('')"
                />
              </div>
              <div class="invalid-feedback d-block" v-if="v$.formData.password.$error && fieldsTouched.password">
                {{ v$.formData.password.$errors[0].$message }}
              </div>
              <small class="text-muted">Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.</small>
            </div>
            <div class="mb-4">
              <div class="input-group input-group-lg">
                <span class="input-group-text bg-light border-end-0">
                  <i class="bi bi-lock-fill fs-3"></i>
                </span>
                <input
                  type="password"
                  class="form-control form-control-lg border-start-0 py-3 fs-5"
                  :class="{ 'is-invalid': passwordMismatch && confirmPasswordTouched }"
                  id="confirmPassword"
                  v-model="formData.confirmPassword"
                  placeholder="Confirm password"
                  required
                  :disabled="isLoading"
                  @blur="handleConfirmPasswordBlur"
                  oninvalid="this.setCustomValidity('Please confirm your password')"
                  oninput="this.setCustomValidity('')"
                />
              </div>
              <div class="invalid-feedback d-block" v-if="passwordMismatch && confirmPasswordTouched">
                Passwords do not match
              </div>
            </div>
            <div class="mb-4">
              <div class="input-group input-group-lg">
                <span class="input-group-text bg-light border-end-0">
                  <i class="bi bi-person-badge-fill fs-3"></i>
                </span>
                <select
                  class="form-select form-select-lg border-start-0 py-3 fs-5"
                  :class="{ 'is-invalid': v$.formData.role.$error && fieldsTouched.role }"
                  id="role"
                  v-model="formData.role"
                  required
                  :disabled="isLoading"
                  @blur="handleFieldBlur('role')"
                  oninvalid="this.setCustomValidity('Please select a role')"
                  oninput="this.setCustomValidity('')"
                >
                  <option value="">Select role</option>
                  <option value="elderly">Elderly</option>
                  <option value="volunteer">Volunteer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div class="invalid-feedback d-block" v-if="v$.formData.role.$error && fieldsTouched.role">
                {{ v$.formData.role.$errors[0].$message }}
              </div>
            </div>
            <div class="d-grid gap-2 mb-4">
              <button 
                type="submit" 
                class="btn btn-primary btn-lg py-3 fs-4"
                :disabled="isLoading || (passwordMismatch && confirmPasswordTouched)"
              >
                <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                <i v-else class="bi bi-person-plus-fill me-2"></i>
                {{ isLoading ? 'Registering...' : 'Register' }}
              </button>
            </div>
            <div class="text-center">
              <router-link to="/login" class="text-decoration-none fs-4" :tabindex="isLoading ? -1 : 0">
                <i class="bi bi-box-arrow-in-right me-1"></i>
                Already have an account? Login here
              </router-link>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useVuelidate } from '@vuelidate/core'
import { required, helpers } from '@vuelidate/validators'
import firebaseAuth from '../services/firebaseAuth'

const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

export default {
  name: 'Register',
  setup() {
    const router = useRouter()
    const toast = useToast()
    const formData = ref({
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
      role: ''
    })
    const isLoading = ref(false)
    const passwordMismatch = ref(false)
    const confirmPasswordTouched = ref(false)
    const fieldsTouched = ref({
      email: false,
      username: false,
      password: false,
      role: false
    })

    const rules = {
      formData: {
        email: { 
          required: helpers.withMessage('Email is required', required)
        },
        username: { 
          required: helpers.withMessage('Username is required', required),
          format: helpers.withMessage(
            'Username must be 3-20 characters long and contain only letters, numbers, and underscores',
            helpers.regex(usernameRegex)
          )
        },
        password: { 
          required: helpers.withMessage('Password is required', required),
          format: helpers.withMessage(
            'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character',
            helpers.regex(passwordRegex)
          )
        },
        confirmPassword: { 
          required: helpers.withMessage('Please confirm your password', required)
        },
        role: { required: helpers.withMessage('Please select a role', required) }
      }
    }

    const v$ = useVuelidate(rules, { formData })

    // Watch for changes in all relevant fields for validation
    watch(formData, () => {
        // Validate the entire form if any of the watched fields have been touched
        if (fieldsTouched.value.email || fieldsTouched.value.username || fieldsTouched.value.password || fieldsTouched.value.role) {
            v$.value.$validate();
        }

        // Specifically handle password confirmation logic
        if (confirmPasswordTouched.value) {
            passwordMismatch.value = formData.value.password !== formData.value.confirmPassword;
        }
    }, { deep: true });


    // Handle confirm password field blur event
    const handleConfirmPasswordBlur = () => {
      confirmPasswordTouched.value = true
      if (formData.value.confirmPassword) {
        passwordMismatch.value = formData.value.confirmPassword !== formData.value.password
      }
    }

    // Handle input field blur event
    const handleFieldBlur = async (field) => {
      fieldsTouched.value[field] = true
      await v$.value.$validate()
    }

    const handleRegister = async () => {
      // Mark all fields as touched
      Object.keys(fieldsTouched.value).forEach(field => {
        fieldsTouched.value[field] = true
      })
      confirmPasswordTouched.value = true

      const isFormCorrect = await v$.value.$validate()
      if (!isFormCorrect || passwordMismatch.value) {
        if (passwordMismatch.value) {
          toast.error("Passwords do not match", {
            timeout: 2000
          })
        } else {
          toast.error("Please fix the form errors", {
            timeout: 2000
          })
        }
        return
      }

      try {
        isLoading.value = true
        
        // Check if user already exists
        const userExists = await firebaseAuth.isUserExists(formData.value.email)
        
        if (userExists) {
          toast.error("Email already exists", {
            timeout: 2000
          })
          return
        }

        // Register user with Firebase
        await firebaseAuth.register(
          formData.value.email,
          formData.value.password,
          formData.value.username,
          formData.value.role
        )

        toast.success("Registration successful!", {
          timeout: 1500
        })

        setTimeout(() => {
          router.push('/login')
        }, 1500)
      } catch (error) {
        console.error('Registration error:', error)
        toast.error(error.message || "Registration failed. Please try again.", {
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
      passwordMismatch,
      handleConfirmPasswordBlur,
      handleFieldBlur,
      handleRegister,
      fieldsTouched,
      confirmPasswordTouched
    }
  }
}
</script>

<style scoped>
/*
  Final Stable Version:
  Restored original layout, colors, and shadows.
  Permanently removed performance-intensive properties like `backdrop-filter`
  and interactive transforms/animations to guarantee stability.
*/
.register-page {
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
  background-image: url('@/assets/images/5O0Y6Rd3Y3.jpg');
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
  /* Replicating the visual effect of the blur with a slightly stronger but stable overlay */
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
  /* Using a more opaque background instead of the expensive blur filter */
  background: rgba(255, 255, 255, 0.4);
  padding: 2rem;
  z-index: 3;
  /* Restored the original inset shadow */
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
  /* Restored the original complex shadow, as it's less likely to be the issue than blur */
  box-shadow: 
    0 10px 30px rgba(0, 0, 0, 0.1),
    0 1px 8px rgba(0, 0, 0, 0.2);
  margin: 0 auto;
}

.card-header {
  background: linear-gradient(135deg, #2E8B57 0%, #3CB371 100%);
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
  transition: border-color 0.3s ease; /* Simplified transition */
  background: rgba(255, 255, 255, 0.9);
}

.form-control:focus {
  border-color: #2E8B57;
  background: rgba(255, 255, 255, 0.95);
}

.form-select {
  cursor: pointer;
  appearance: none;
  padding-right: 2.5rem;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%232E8B57' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 16px 12px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  font-size: 16px;
  transition: border-color 0.3s ease;
  background-color: rgba(255, 255, 255, 0.9);
}

.form-select:focus {
  border-color: #2E8B57;
  background-color: rgba(255, 255, 255, 0.95);
}

.btn-primary {
  background: linear-gradient(135deg, #2E8B57 0%, #3CB371 100%);
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 16px;
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

.invalid-feedback {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #dc3545;
}
</style> 
 