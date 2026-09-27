import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import NavBar from '../NavBar.vue'

const menuButton = (wrapper: VueWrapper, label: string) =>
  wrapper.findAll('.navElement > button').find((b) => b.text() === label)!

const dropdownItem = (wrapper: VueWrapper, label: string) =>
  wrapper.findAll('.dropdownElement').find((b) => b.text() === label)!

describe('NavBar', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 0, 1, 9, 5))
  })

  afterEach(() => {
    wrapper?.unmount()
    vi.useRealTimers()
  })

  describe('clock', () => {
    it('shows the current time as zero-padded HH:MM', () => {
      wrapper = mount(NavBar)
      expect(wrapper.find('.time').text()).toBe('09:05')
    })

    it('updates as time passes', async () => {
      wrapper = mount(NavBar)
      vi.advanceTimersByTime(60_000)
      await nextTick()
      expect(wrapper.find('.time').text()).toBe('09:06')
    })
  })

  describe('menus', () => {
    it('shows Tools and Help on the desktop', () => {
      wrapper = mount(NavBar, { props: { isInFile: false } })
      const labels = wrapper.findAll('.navElement > button').map((b) => b.text())
      expect(labels).toEqual(['Tools', 'Help'])
    })

    it('shows Edit instead while a file is open', () => {
      wrapper = mount(NavBar, { props: { isInFile: true } })
      const labels = wrapper.findAll('.navElement > button').map((b) => b.text())
      expect(labels).toEqual(['Edit'])
    })

    it('opens a dropdown and highlights its button on click', async () => {
      wrapper = mount(NavBar)
      await menuButton(wrapper, 'Help').trigger('click')
      expect(wrapper.find('.dropdown').exists()).toBe(true)
      expect(menuButton(wrapper, 'Help').classes()).toContain('highlighted')
    })

    it('closes the dropdown when its button is clicked again', async () => {
      wrapper = mount(NavBar)
      await menuButton(wrapper, 'Help').trigger('click')
      await menuButton(wrapper, 'Help').trigger('click')
      expect(wrapper.find('.dropdown').exists()).toBe(false)
    })

    it('switches directly from one dropdown to another', async () => {
      wrapper = mount(NavBar)
      await menuButton(wrapper, 'Help').trigger('click')
      await menuButton(wrapper, 'Tools').trigger('click')
      expect(wrapper.findAll('.dropdown')).toHaveLength(1)
      expect(dropdownItem(wrapper, 'Paint').exists()).toBe(true)
      expect(menuButton(wrapper, 'Help').classes()).not.toContain('highlighted')
    })

    it('closes the open dropdown when clicking elsewhere on the page', async () => {
      wrapper = mount(NavBar, { attachTo: document.body })
      await menuButton(wrapper, 'Help').trigger('click')
      document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await nextTick()
      expect(wrapper.find('.dropdown').exists()).toBe(false)
    })
  })

  describe('menu actions', () => {
    it.each([
      ['Help', 'Welcome', 'toggleWelcome'],
      ['Help', 'Contact', 'toggleContact'],
      ['Help', 'Review', 'toggleReview'],
      ['Help', 'FAQ', 'toggleNotImplemented'],
      ['Tools', 'Paint', 'togglePaint'],
      ['Tools', 'Notes', 'toggleNotImplemented']
    ])('%s > %s emits %s and closes the menu', async (menu, item, event) => {
      wrapper = mount(NavBar)
      await menuButton(wrapper, menu).trigger('click')
      await dropdownItem(wrapper, item).trigger('click')

      expect(wrapper.emitted(event)).toHaveLength(1)
      expect(wrapper.find('.dropdown').exists()).toBe(false)
    })

    it('Edit menu items are not implemented yet', async () => {
      wrapper = mount(NavBar, { props: { isInFile: true } })
      await menuButton(wrapper, 'Edit').trigger('click')
      await dropdownItem(wrapper, 'Undo').trigger('click')
      expect(wrapper.emitted('toggleNotImplemented')).toHaveLength(1)
    })
  })
})
