<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useGameStore } from '@/stores/game'
import IdleView from '@/components/IdleView.vue'
import PlayingView from '@/components/PlayingView.vue'
import CompletedView from '@/components/CompletedView.vue'

const { session } = storeToRefs(useGameStore())
</script>

<template>
  <IdleView v-if="session.phase === 'idle'" />
  <PlayingView v-else-if="session.phase === 'playing'" />
  <CompletedView v-else-if="session.phase === 'completed'" />
</template>
