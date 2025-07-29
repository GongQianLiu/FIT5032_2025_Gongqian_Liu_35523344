<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const loginData = ref({
  username: '',
  password: ''
})

const error = ref(null)

const handleLogin = () => {
  // Get user list from localStorage
  const users = JSON.parse(localStorage.getItem('users') || '[]')
  
  // Find matching user
  const user = users.find(u => 
    u.username === loginData.value.username && 
    u.password === loginData.value.password
  )
  
  // If a matching user is found, or if it's the admin account
  if (user || (loginData.value.username === 'admin' && loginData.value.password === 'password123')) {
    // Store authentication status
    localStorage.setItem('isAuthenticated', 'true')
    // Dispatch a custom event to notify other components that login status has changed
    window.dispatchEvent(new Event('storage'))
    error.value = null
    router.push('/about')
  } else {
    error.value = 'Invalid username or password'
  }
}
</script>

<template>
  <main>
    <div class="container mt-5">
      <div class="row">
        <div class="col-md-6 offset-md-3">
          <div class="card">
            <div class="card-header text-center">
              <h2>Login</h2>
            </div>
            <div class="card-body">
              <form @submit.prevent="handleLogin">
                <div class="mb-3">
                  <label for="username" class="form-label">Username</label>
                  <input
                    type="text"
                    class="form-control"
                    id="username"
                    v-model="loginData.username"
                    required
                  />
                </div>
                <div class="mb-3">
                  <label for="password" class="form-label">Password</label>
                  <input
                    type="password"
                    class="form-control"
                    id="password"
                    v-model="loginData.password"
                    required
                  />
                </div>
                <div v-if="error" class="alert alert-danger" role="alert">
                  {{ error }}
                </div>
                <div class="text-center">
                  <button type="submit" class="btn btn-primary">Login</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template> 