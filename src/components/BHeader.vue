<script setup>
import { ref, onMounted } from 'vue'
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from '@/firebase/init'
import { useRouter } from 'vue-router'

const router = useRouter()
const isLoggedIn = ref(false)

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      isLoggedIn.value = true;
    } else {
      isLoggedIn.value = false;
    }
  });
});

const handleSignOut = () => {
  signOut(auth).then(() => {
    router.push("/");
  });
};
</script>

<template>
  <div class="container">
    <header class="d-flex justify-content-center py-3">
      <ul class="nav nav-pills">
        <li class="nav-item mx-2">
          <router-link to="/" class="nav-link" active-class="active" exact>Home (Week 5)</router-link>
        </li>
        <li class="nav-item mx-2">
          <router-link to="/about" class="nav-link" active-class="active">About</router-link>
        </li>
        <li class="nav-item mx-2">
          <router-link to="/addbook" class="nav-link" active-class="active">Add Book</router-link>
        </li>
        <li class="nav-item mx-2">
          <router-link to="/WeatherCheck" class="nav-link" active-class="active">Get Weather</router-link>
        </li>
        <li class="nav-item mx-2">
          <router-link to="/CountBookAPI" class="nav-link" active-class="active">Count Book API</router-link>
        </li>
        <li class="nav-item mx-2">
          <router-link to="/GetAllBookAPI" class="nav-link" active-class="active">Get All Book API</router-link>
        </li>
        <li class="nav-item mx-2">
          <router-link to="/FireLogin" class="nav-link" active-class="active">Firebase Login</router-link>
        </li>
        <li class="nav-item mx-2">
          <router-link to="/FireRegister" class="nav-link" active-class="active">Firebase Register</router-link>
        </li>

        <li class="nav-item mx-2" v-if="isLoggedIn">
          <a href="#" class="nav-link" @click.prevent="handleSignOut">Sign Out</a>
        </li>
      </ul>
    </header>
  </div>
</template>

<style scoped>
.nav-link {
  color: #275fda;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  transition: all 0.3s ease;
}

.nav-link:hover {
  background-color: #275fda;
  color: white;
}

.nav-link.active {
  background-color: #275fda !important;
  color: white !important;
}

.nav-pills {
  background-color: #f8f9fa;
  padding: 0.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
