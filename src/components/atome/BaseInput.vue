<template>
  <div class="input-container">
    <label :for="id" class="input-label">{{ label }}</label>
    <br>
    <input
      :id="id"
      :type="type"
      v-model="inputValue" 
      :placeholder="placeholder"
      :disabled="disabled"
      @blur="handleBlur"
      @focus="handleFocus"
      class="base-input"
    />
    <p v-if="error" class="error-message">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue';

// Recevoir la prop `modelValue` via `defineProps`
const props = defineProps({
  label: String,
  id: String,
  type: {
    type: String,
    default: 'text'
  },
  placeholder: String,
  disabled: Boolean,
  error: String,
  modelValue: {
    type: String,
    default: ''
  }
});

// Émettre l'événement `update:modelValue` quand la valeur change
const emit = defineEmits(['update:modelValue']);

// Créer une variable réactive interne qui lie la valeur du champ
const inputValue = ref(props.modelValue);

// Observer la valeur de `inputValue` et propager les changements au parent
watch(inputValue, (newValue) => {
  emit('update:modelValue', newValue);  // Cela met à jour la valeur du parent
});

function handleFocus() {
  console.log('Champ focus');
}

function handleBlur() {
  console.log('Champ blur');
}
</script>

<style scoped>
.input-container {
  margin-bottom: 1.5rem;
  position: relative;
}

.input-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  color: #2b2d42;
  transition: all 0.3s ease;
}

.base-input {
  width: 100%;
  padding: 0.9rem 1.2rem;
  font-size: 0.95rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background-color: #ffffff;
  color: #2b2d42;
  outline: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.base-input:focus {
  border-color: #4361ee;
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.2);
}

.base-input:disabled {
  background-color: #f8fafc;
  color: #94a3b8;
  cursor: not-allowed;
}

.base-input::placeholder {
  color: #94a3b8;
  opacity: 1;
}

.error-message {
  color: #ef233c;
  font-size: 0.8rem;
  margin-top: 0.5rem;
  padding-left: 0.25rem;
  animation: fadeIn 0.3s ease-out;
}

/* Animation pour les messages d'erreur */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Style lorsque le champ est en erreur */
.base-input[aria-invalid="true"] {
  border-color: #ef233c;
}

.base-input[aria-invalid="true"]:focus {
  box-shadow: 0 0 0 3px rgba(239, 35, 60, 0.2);
}

/* Version plus grande sur les petits écrans */
@media (max-width: 480px) {
  .base-input {
    padding: 1rem 1.2rem;
  }
}
</style>
