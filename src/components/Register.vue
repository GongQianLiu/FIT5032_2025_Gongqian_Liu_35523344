<template>
  <div class="register-page">
    <div class="auth-container">
      <div class="auth-card">
        <div class="card-header text-white text-center py-4">
          <h1 class="display-4 fw-bold mb-0">Evergreen Way</h1>
          <p class="mb-0 mt-2 fs-3">Register</p>
        </div>
        <div class="card-body p-4 p-md-5">
          <form @submit.prevent="handleRegister">
            <div class="mb-4">
              <div class="input-group input-group-lg">
                <span class="input-group-text bg-light border-end-0">
                  <i class="bi bi-person-fill fs-3"></i>
                </span>
                <input
                  type="text"
                  class="form-control form-control-lg border-start-0 py-3 fs-5"
                  id="username"
                  v-model="formData.username"
                  placeholder="Enter username"
                  required
                  :disabled="isLoading"
                />
              </div>
            </div>
            <div class="mb-4">
              <div class="input-group input-group-lg">
                <span class="input-group-text bg-light border-end-0">
                  <i class="bi bi-lock-fill fs-3"></i>
                </span>
                <input
                  type="password"
                  class="form-control form-control-lg border-start-0 py-3 fs-5"
                  id="password"
                  v-model="formData.password"
                  placeholder="Enter password"
                  required
                  :disabled="isLoading"
                />
              </div>
            </div>
            <div class="mb-5">
              <div class="input-group input-group-lg">
                <span class="input-group-text bg-light border-end-0">
                  <i class="bi bi-person-badge-fill fs-3"></i>
                </span>
                <select 
                  class="form-select form-select-lg border-start-0 py-3 fs-5" 
                  id="role" 
                  v-model="formData.role" 
                  required
                  :disabled="isLoading"
                >
                  <option value="">Select role</option>
                  <option value="elderly">Senior</option>
                  <option value="volunteer">Volunteer</option>
                </select>
              </div>
            </div>
            <div class="d-grid gap-2 mb-4">
              <button 
                type="submit" 
                class="btn btn-primary btn-lg py-3 fs-4"
                :disabled="isLoading"
              >
                <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                <i v-else class="bi bi-person-plus-fill me-2"></i>
                {{ isLoading ? 'Registering...' : 'Register' }}
              </button>
            </div>
            <div class="text-center">
              <router-link to="/login" class="text-decoration-none fs-4" :tabindex="isLoading ? -1 : 0">
                <i class="bi bi-box-arrow-in-right me-1"></i>
                Already have an account? Sign in
              </router-link>
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
import userService from '../services/userService'

export default {
  name: 'Register',
  setup() {
    const router = useRouter()
    const toast = useToast()
    const formData = ref({
      username: '',
      password: '',
      role: ''
    })
    const isLoading = ref(false)

    const handleRegister = async () => {
      if (!formData.value.username || !formData.value.password || !formData.value.role) {
        toast.error("Please fill in all fields", {
          timeout: 2000
        })
        return
      }

      try {
        isLoading.value = true
        
        // 检查用户名是否存在
        const exists = await userService.isUserExists(formData.value.username)
        if (exists) {
          toast.error("Username already exists", {
            timeout: 2000
          })
          return
        }

        // 创建新用户
        await userService.addUser({
          username: formData.value.username,
          password: formData.value.password,
          role: formData.value.role
        })

        // 清除表单
        formData.value = {
          username: '',
          password: '',
          role: ''
        }

        toast.success("Registration successful!", {
          timeout: 1500
        })

        // 短暂延迟后跳转，让用户看到成功提示
        setTimeout(() => {
          router.push('/login')
        }, 1000)
      } catch (error) {
        console.error('Registration error:', error)
        toast.error("Registration failed. Please try again.", {
          timeout: 2000
        })
      } finally {
        isLoading.value = false
      }
    }

    return {
      formData,
      handleRegister,
      isLoading
    }
  }
}
</script>

<style scoped>
.register-page {
  background: linear-gradient(135deg, #6B8DD6 0%, #8E37D7 100%);
  min-height: 100vh;
  min-width: 100vw;
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
}

.auth-container {
  width: min(90%, 1400px);
  margin: auto;
  padding: 2rem;
}

.auth-card {
  background: rgba(255, 255, 255, 0.98);
  border-radius: 25px;
  overflow: hidden;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  width: 100%;
  margin: 0 auto;
  position: relative;
}

.card-header {
  position: relative;
  padding: 3rem 2rem;
  background: linear-gradient(135deg, #4A90E2 0%, #8E37D7 100%);
}

.card-header::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 4px;
  background-color: #fff;
  border-radius: 2px;
}

.card-body {
  max-width: 800px;
  margin: 0 auto;
  padding: 3rem 2rem !important;
}

.input-group-text {
  border-radius: 15px 0 0 15px;
  width: 65px;
  justify-content: center;
  background-color: #f8f9fa;
  border: 2px solid #e9ecef;
  border-right: none;
}

.form-control, .form-select {
  border-radius: 0 15px 15px 0;
  padding: 1.5rem 1.2rem;
  font-size: 1.2rem;
  height: auto;
  border: 2px solid #e9ecef;
  border-left: none;
}

.form-control:focus, .form-select:focus {
  box-shadow: none;
  border-color: #8E37D7;
}

.btn-primary {
  background: linear-gradient(135deg, #4A90E2 0%, #8E37D7 100%);
  border: none;
  border-radius: 15px;
  font-weight: 600;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  padding: 1rem 2rem;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(142, 55, 215, 0.4);
}

.router-link-active {
  color: #8E37D7;
}

a {
  color: #6B8DD6;
  transition: all 0.3s ease;
}

a:hover {
  color: #8E37D7;
}

/* 响应式设计 */
@media (max-width: 576px) {
  .auth-container {
    width: 95%;
    padding: 1rem;
  }

  .card-header {
    padding: 2rem 1rem;
  }

  .card-body {
    padding: 2rem 1.5rem !important;
  }
}

@media (min-width: 577px) and (max-width: 991px) {
  .auth-card {
    max-width: 90%;
  }
}

@media (min-width: 992px) {
  .auth-card {
    max-width: 80%;
  }
}

@media (min-width: 1200px) {
  .auth-card {
    max-width: 70%;
  }
}

@media (min-width: 1400px) {
  .auth-card {
    max-width: 60%;
  }
}
</style> 
