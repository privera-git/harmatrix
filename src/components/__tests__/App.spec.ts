import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import App from '@/App.vue'

describe('App', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders IdleView when session is idle', () => {
    const wrapper = mount(App)
    expect(wrapper.findComponent({ name: 'IdleView' }).exists()).toBe(true)
  })

  it('does not render PlayingView or CompletedView on initial load', () => {
    const wrapper = mount(App)
    expect(wrapper.findComponent({ name: 'PlayingView' }).exists()).toBe(false)
    expect(wrapper.findComponent({ name: 'CompletedView' }).exists()).toBe(false)
  })
})
