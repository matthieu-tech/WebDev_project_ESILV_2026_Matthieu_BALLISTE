import { ref, watch } from 'vue'

const dark = ref(localStorage.getItem('theme') === 'dark')

document.documentElement.classList.toggle('dark', dark.value)

watch(dark, (val) => {
  document.documentElement.classList.toggle('dark', val)
  localStorage.setItem('theme', val ? 'dark' : 'light')
})

export function useTheme() {
  return {
    dark,
    toggle: () => { dark.value = !dark.value },
  }
}
