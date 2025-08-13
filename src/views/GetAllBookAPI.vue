<template>
  <div v-if="apiResponse" class="api-response">
    <pre>{{ JSON.stringify(apiResponse, null, 2) }}</pre>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const authors = ref([])
const loading = ref(false)
const error = ref(null)
const apiResponse = ref(null)

const getAllBooks = () => {
  const allBooks = []
  authors.value.forEach(author => {
    author.famousWorks.forEach(book => {
      allBooks.push({
        author: author.name,
        title: book.title,
        year: book.year,
        authorId: author.id,
        authorBirthYear: author.birthYear,
        genres: author.genres
      })
    })
  })
  return allBooks
}

const getApiData = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await fetch('src/assets/json/authors.json')
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    authors.value = data
    
    apiResponse.value = {
      success: true,
      data: {
        totalBooks: getAllBooks().length,
        totalAuthors: authors.value.length,
        books: getAllBooks()
      },
      timestamp: new Date().toISOString()
    }
    
  } catch (err) {
    error.value = `Error loading authors data: ${err.message}`
    console.error('Error loading authors data:', err)
    apiResponse.value = null
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getApiData();
})

defineExpose({
  getApiData
})
</script>

<style scoped>

</style> 