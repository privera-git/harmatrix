import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { FEATURES } from '@/config/features'
import { useProgressStore } from '@/stores/progress'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

if (FEATURES.DEV_STAGE_JUMP) {
  const params = new URLSearchParams(window.location.search)
  const stageParam = params.get('stage')
  const subStageParam = params.get('substage')
  const guidanceParam = params.get('guidance')
  if (stageParam !== null || subStageParam !== null || guidanceParam !== null) {
    const store = useProgressStore(pinia)
    if (stageParam !== null || subStageParam !== null) {
      store.jumpToPosition(
        parseInt(stageParam ?? '1', 10),
        parseInt(subStageParam ?? '1', 10),
      )
    }
    if (guidanceParam === 'full' || guidanceParam === 'hint' || guidanceParam === 'none') {
      store.setGuidanceOverride(guidanceParam)
    }
  }
}

app.mount('#app')
