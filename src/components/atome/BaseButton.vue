<template>
  <button
    :class="['base-button', variant]"
    @click="handleClick"
  >
    <slot>Mon bouton</slot>
  </button>
</template>

<script setup>
defineProps({
    variant: {
      type: String,
      default: 'primary' // 'primary', 'secondary', etc.
    }
  });
const emit = defineEmits(['click']); // Déclare l'émission de l'événement "click"

function handleClick() {
  emit('click'); // Émet l'événement "click" quand le bouton est cliqué
}
</script>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.85rem 1.75rem;
  font-size: 0.95rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-transform: none;
  letter-spacing: 0.5px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.base-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.base-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.1);
}

.base-button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.3);
}

/* Variant Primary */
.primary {
  background-color: var(--primary-color, #4361ee);
  color: white;
}

.primary:hover {
  background-color: var(--primary-hover, #3a56d4);
}

/* Variant Secondary */
.secondary {
  background-color: #f1f5f9;
  color: #334155;
  border: 1px solid #e2e8f0;
}

.secondary:hover {
  background-color: #e2e8f0;
  border-color: #cbd5e1;
}

/* Variant Outline (ajout recommandé) */
.outline {
  background-color: transparent;
  color: var(--primary-color, #4361ee);
  border: 2px solid var(--primary-color, #4361ee);
}

.outline:hover {
  background-color: rgba(67, 97, 238, 0.05);
}

/* Variant Text (ajout recommandé) */
.text {
  background-color: transparent;
  color: var(--primary-color, #4361ee);
  box-shadow: none;
  padding: 0.5rem 1rem;
}

.text:hover {
  background-color: rgba(67, 97, 238, 0.05);
  text-decoration: underline;
}

/* Effet de chargement (optionnel) */
.loading {
  pointer-events: none;
  opacity: 0.8;
}

.loading::after {
  content: "";
  position: absolute;
  width: 16px;
  height: 16px;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;
  border: 3px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Taille réduite */
.small {
  padding: 0.5rem 1.25rem;
  font-size: 0.85rem;
}

/* Taille grande */
.large {
  padding: 1rem 2rem;
  font-size: 1.1rem;
}

/* Bouton plein largeur */
.full-width {
  width: 100%;
  display: flex;
}
</style>