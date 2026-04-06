<script setup>
defineProps({
  message: { type: String, required: true },
})
const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <Teleport to="body">
    <div class="overlay" @click.self="emit('cancel')">
      <div class="dialog">
        <p class="dialog-message">{{ message }}</p>
        <div class="dialog-actions">
          <button class="btn-cancel" @click="emit('cancel')">Annuler</button>
          <button class="btn-confirm" @click="emit('confirm')">Se déconnecter</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.15s ease;
}

@keyframes fadeIn {
  from { opacity: 0 }
  to { opacity: 1 }
}

.dialog {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  width: 100%;
  max-width: 360px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0 }
  to { transform: translateY(0); opacity: 1 }
}

.dialog-message {
  font-size: 1rem;
  color: #1a1a2e;
  margin: 0 0 1.5rem;
  text-align: center;
  line-height: 1.5;
}

.dialog-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}

.btn-cancel {
  padding: 0.6rem 1.25rem;
  background: transparent;
  border: 1.5px solid #ddd;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.btn-cancel:hover {
  border-color: #aaa;
  color: #333;
}

.btn-confirm {
  padding: 0.6rem 1.25rem;
  background: #ef4444;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  color: white;
  cursor: pointer;
  transition: background 0.2s;
  font-weight: 600;
}

.btn-confirm:hover {
  background: #dc2626;
}
</style>
