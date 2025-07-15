
<template>
  <div class="container-fluid mt-5">
    <!-- Form Section -->
    <div class="row mb-5">
      <div class="col-md-8 offset-md-2">
        <h1 class="text-center">User Information Form</h1>
        <form @submit.prevent="submitForm">
          <div class="row mb-3">
            <div class="col-sm-6">
              <label for="username" class="form-label">Username</label>
              <input 
                type="text" 
                class="form-control" 
                id="username" 
                @blur="() => validateName(true)"
                @input="() => validateName(false)"
                v-model="formData.username">
              <div v-if="errors.username" class="text-danger">{{ errors.username }}</div>
            </div>
            <div class="col-sm-6">
              <label for="password" class="form-label">Password</label>
              <input 
                type="password" 
                class="form-control"
                id="password" 
                @blur="() => validatePassword(true)"
                @input="() => validatePassword(false)"
                v-model="formData.password">
              <div v-if="errors.password" class="text-danger">{{ errors.password }}</div>
            </div>
          </div>
          <div class="row mb-3">
            <div class="col-sm-6">
              <div class="form-check">
                <input 
                  type="checkbox" 
                  class="form-check-input" 
                  id="isAustralian" 
                  v-model="formData.isAustralian">
                <label class="form-check-label" for="isAustralian">Australian Resident?</label>
              </div>
            </div>
            <div class="col-sm-6">
              <label for="gender" class="form-label">Gender</label>
              <select 
                class="form-select"
                id="gender" 
                @blur="() => validateGender(true)"
                @change="() => validateGender(true)"
                v-model="formData.gender">
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <div v-if="errors.gender" class="text-danger">{{ errors.gender }}</div>
            </div>
          </div>
          <div class="row mb-3">
            <div class="col">
              <label for="reason" class="form-label">Reason for joining</label>
              <textarea 
                class="form-control"
                id="reason" 
                rows="3"
                @blur="() => validateReason(true)"
                @input="() => validateReason(false)" 
                v-model="formData.reason"></textarea>
              <div v-if="errors.reason" class="text-danger">{{ errors.reason }}</div>
            </div>
          </div>

          <div class="text-center">
            <button type="submit" class="btn btn-primary me-2">Submit</button>
            <button type="button" class="btn btn-secondary" @click="clearForm">Clear</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Table Section - Full Width -->
    <div class="row" v-if="submittedCards.length > 0">
      <div class="col-12">
        <DataTable :value="submittedCards" stripedRows :resizableColumns="true" columnResizeMode="fit" class="w-100">
          <Column field="username" header="Username" style="width: 15%"></Column>
          <Column field="password" header="Password" style="width: 15%"></Column>
          <Column field="isAustralian" header="Australian Resident" style="width: 15%">
            <template #body="slotProps">
              {{ slotProps.data.isAustralian ? 'true' : 'false' }}
            </template>
          </Column>
          <Column field="gender" header="Gender" style="width: 15%">
            <template #body="slotProps">
              {{ slotProps.data.gender || 'Not specified' }}
            </template>
          </Column>
          <Column field="reason" header="Reason" style="width: 40%">
            <template #body="slotProps">
              {{ slotProps.data.reason || 'None' }}
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

const formData = ref({
    username: '',
    password: '',
    isAustralian: false,
    reason: '',
    gender: ''
})

const errors = ref({
    username: null,
    password: null,
    gender: null,
    reason: null
})

const submittedCards = ref([])

const validateName = (blur) => {
    if (formData.value.username.length < 3) {
        if (blur) errors.value.username = "Name must be at least 3 characters";
        return false;
    } else if (!/^[a-zA-Z0-9]+$/.test(formData.value.username)) {
        if (blur) errors.value.username = "Username can only contain letters and numbers";
        return false;
    } else {
        errors.value.username = null;
        return true;
    }
}

const validatePassword = (blur) => {
    const password = formData.value.password;
    const minLength = 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
        if (blur) errors.value.password = `Password must be at least ${minLength} characters long.`;
        return false;
    } else if (!hasUppercase) {
        if (blur) errors.value.password = "Password must contain at least one uppercase letter.";
        return false;
    } else if (!hasLowercase) {
        if (blur) errors.value.password = "Password must contain at least one lowercase letter.";
        return false;
    } else if (!hasNumber) {
        if (blur) errors.value.password = "Password must contain at least one number.";
        return false;
    } else if (!hasSpecialChar) {
        if (blur) errors.value.password = "Password must contain at least one special character.";
        return false;
    } else {
        errors.value.password = null;
        return true;
    }
}

const validateGender = (blur) => {
    if (!formData.value.gender) {
        if (blur) errors.value.gender = "Please select a gender";
        return false;
    } else {
        errors.value.gender = null;
        return true;
    }
}

const validateReason = (blur) => {
    if (formData.value.reason.length > 100) {
        if (blur) errors.value.reason = "Reason cannot exceed 100 characters";
        return false;
    } else {
        errors.value.reason = null;
        return true;
    }
}

const clearForm = () => {
    formData.value = {
        username: '',
        password: '',
        isAustralian: false,
        gender: '',
        reason: ''
    }
    // Clear all errors when form is cleared
    errors.value = {
        username: null,
        password: null,
        gender: null,
        reason: null
    }
}

const submitForm = () => {
    // Validate all fields
    const isUsernameValid = validateName(true);
    const isPasswordValid = validatePassword(true);
    const isGenderValid = validateGender(true);
    const isReasonValid = validateReason(true);

    if (isUsernameValid && isPasswordValid && isGenderValid && isReasonValid) {
        submittedCards.value.push({ ...formData.value });
        clearForm();
    }
}
</script>

<style scoped>
.form-control:focus,
.form-select:focus {
    border-color: #275FDA;
    box-shadow: 0 0 0 0.2rem rgba(39, 95, 218, 0.25);
}

.btn-primary {
    background-color: #275FDA;
    border-color: #275FDA;
}

.btn-primary:hover {
    background-color: #1e4cb3;
    border-color: #1e4cb3;
}

:deep(.p-datatable) {
    margin-top: 2rem;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
    background-color: #f8f9fa;
    color: #333;
}

:deep(.p-datatable .p-datatable-tbody > tr.p-highlight) {
    background-color: #f8f9fa;
}

:deep(.p-datatable.p-datatable-striped .p-datatable-tbody > tr:nth-child(even)) {
    background-color: #f8f9fa;
}
</style>



