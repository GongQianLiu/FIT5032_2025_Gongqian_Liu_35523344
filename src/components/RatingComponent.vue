<template>
  <div class="rating-component">
    <div class="stars">
      <template v-for="star in 5" :key="star">
        <i
          class="bi"
          :class="{
            'bi-star-fill': star <= rating,
            'bi-star': star > rating,
            'text-warning': star <= rating
          }"
          @click="setRating(star)"
          @mouseover="hoverRating = star"
          @mouseleave="hoverRating = rating"
        ></i>
      </template>
    </div>
    <div class="rating-info" v-if="showAverage">
      <span class="average-rating">Average: {{ averageRating.toFixed(1) }}</span>
      <span class="total-ratings">({{ totalRatings }} ratings)</span>
    </div>
    <div class="rating-comment" v-if="allowComment">
      <textarea
        v-model="comment"
        class="form-control"
        :placeholder="commentPlaceholder"
        :rows="3"
        :disabled="isSubmitting"
      ></textarea>
      <button
        class="btn btn-primary mt-2"
        @click="submitRating"
        :disabled="!canSubmit || isSubmitting"
      >
        <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
        {{ submitButtonText }}
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'

export default {
  name: 'RatingComponent',
  props: {
    initialRating: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0
    },
    totalRatings: {
      type: Number,
      default: 0
    },
    showAverage: {
      type: Boolean,
      default: true
    },
    allowComment: {
      type: Boolean,
      default: true
    },
    commentPlaceholder: {
      type: String,
      default: 'Share your experience...'
    },
    submitButtonText: {
      type: String,
      default: 'Submit Rating'
    },
    serviceId: {
      type: String,
      required: true
    }
  },
  emits: ['rating-submitted'],
  setup(props, { emit }) {
    const toast = useToast()
    const rating = ref(props.initialRating)
    const hoverRating = ref(props.initialRating)
    const comment = ref('')
    const isSubmitting = ref(false)

    const canSubmit = computed(() => {
      return rating.value > 0 && (!props.allowComment || comment.value.trim().length > 0)
    })

    const setRating = (value) => {
      rating.value = value
      hoverRating.value = value
    }

    const submitRating = async () => {
      if (!canSubmit.value) return

      try {
        isSubmitting.value = true
        
        // Get current user information
        const currentUser = JSON.parse(localStorage.getItem('currentUser'))
        if (!currentUser) {
          toast.error('Please login to submit a rating')
          return
        }

        const ratingData = {
          serviceId: props.serviceId,
          userId: currentUser.id,
          rating: rating.value,
          comment: comment.value.trim(),
          createdAt: new Date().toISOString()
        }

        // Send rating to backend
        const response = await fetch('http://localhost:3000/api/ratings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(ratingData)
        })

        if (!response.ok) {
          throw new Error('Failed to submit rating')
        }

        toast.success('Rating submitted successfully!')
        emit('rating-submitted', ratingData)
        
        // Reset form
        comment.value = ''
        rating.value = 0
        hoverRating.value = 0
      } catch (error) {
        console.error('Failed to submit rating:', error)
        toast.error('Failed to submit rating. Please try again.')
      } finally {
        isSubmitting.value = false
      }
    }

    return {
      rating,
      hoverRating,
      comment,
      isSubmitting,
      canSubmit,
      setRating,
      submitRating
    }
  }
}
</script>

<style scoped>
.rating-component {
  padding: 1rem;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stars {
  display: flex;
  gap: 0.5rem;
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.stars i {
  cursor: pointer;
  transition: all 0.2s ease;
}

.stars i:hover {
  transform: scale(1.2);
}

.rating-info {
  margin-bottom: 1rem;
  color: #666;
}

.average-rating {
  font-weight: bold;
  margin-right: 0.5rem;
}

.total-ratings {
  font-size: 0.9rem;
}

.rating-comment textarea {
  resize: none;
  margin-bottom: 0.5rem;
}

button {
  min-width: 120px;
}
</style> 