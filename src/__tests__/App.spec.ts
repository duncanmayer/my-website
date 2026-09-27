import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import App from '../App.vue'
import NavBar from '../components/NavBar.vue'
import DesktopFileIcon from '../components/DesktopContent/DesktopFileIcon.vue'

const zIndexOf = (wrapper: VueWrapper, dialogClass: string) =>
  Number((wrapper.find(`.dialog.${dialogClass}`).element as HTMLElement).style.zIndex)

const isOpen = (wrapper: VueWrapper, dialogClass: string) =>
  wrapper.find(`.dialog.${dialogClass}`).exists()

describe('App window management', () => {
  let wrapper: VueWrapper
  let root: HTMLElement

  beforeEach(() => {
    vi.useFakeTimers()
    // App reads the desktop size from #app before mounting
    root = document.createElement('div')
    root.id = 'app'
    document.body.appendChild(root)
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      width: 1000,
      height: 800,
      top: 0,
      left: 0,
      right: 1000,
      bottom: 800
    } as DOMRect)
    vi.spyOn(console, 'log').mockImplementation(() => {})
    wrapper = mount(App, { attachTo: root })
  })

  afterEach(() => {
    wrapper.unmount()
    root.remove()
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('opens with the welcome dialog on top of the contact dialog', () => {
    expect(isOpen(wrapper, 'welcome')).toBe(true)
    expect(isOpen(wrapper, 'contact')).toBe(true)
    expect(isOpen(wrapper, 'review')).toBe(false)
    expect(zIndexOf(wrapper, 'welcome')).toBeGreaterThan(zIndexOf(wrapper, 'contact'))
  })

  it('brings a dialog to the front when it is clicked', async () => {
    await wrapper.find('.dialog.contact').trigger('click')
    expect(zIndexOf(wrapper, 'contact')).toBeGreaterThan(zIndexOf(wrapper, 'welcome'))

    await wrapper.find('.dialog.welcome').trigger('click')
    expect(zIndexOf(wrapper, 'welcome')).toBeGreaterThan(zIndexOf(wrapper, 'contact'))
  })

  it('keeps raising the clicked dialog above every other one', async () => {
    const nav = wrapper.findComponent(NavBar)
    nav.vm.$emit('toggleReview')
    await nextTick()

    for (const dialog of ['contact', 'welcome', 'review', 'contact']) {
      await wrapper.find(`.dialog.${dialog}`).trigger('click')
      const others = ['welcome', 'contact', 'review'].filter((d) => d !== dialog)
      for (const other of others) {
        expect(zIndexOf(wrapper, dialog)).toBeGreaterThan(zIndexOf(wrapper, other))
      }
    }
  })

  it('closes a dialog from its X button', async () => {
    await wrapper.find('.dialog.contact .button-container button').trigger('click')
    expect(isOpen(wrapper, 'contact')).toBe(false)
  })

  it('reopens a closed dialog on top of everything else', async () => {
    await wrapper.find('.dialog.contact .button-container button').trigger('click')
    await wrapper.find('.dialog.welcome').trigger('click')

    wrapper.findComponent(NavBar).vm.$emit('toggleContact')
    await nextTick()
    expect(isOpen(wrapper, 'contact')).toBe(true)
    expect(zIndexOf(wrapper, 'contact')).toBeGreaterThan(zIndexOf(wrapper, 'welcome'))
  })

  it('opens a nav bar dialog in front of the open ones', async () => {
    wrapper.findComponent(NavBar).vm.$emit('toggleReview')
    await nextTick()
    expect(isOpen(wrapper, 'review')).toBe(true)
    expect(zIndexOf(wrapper, 'review')).toBeGreaterThan(zIndexOf(wrapper, 'welcome'))
  })

  describe('opening the resume file', () => {
    it('plays the loading animation, then opens the resume and switches the menus', async () => {
      wrapper.findComponent(DesktopFileIcon).vm.$emit('openFile')
      await nextTick()
      expect(wrapper.find('.loadingSquare').exists()).toBe(true)
      expect(isOpen(wrapper, 'resume')).toBe(false)

      vi.advanceTimersByTime(700)
      await nextTick()
      expect(isOpen(wrapper, 'resume')).toBe(true)
      expect(wrapper.find('iframe[src*="Duncan_Mayer_Resume.pdf"]').exists()).toBe(true)
      expect(wrapper.findComponent(NavBar).props('isInFile')).toBe(true)

      vi.advanceTimersByTime(1000)
      await nextTick()
      expect(wrapper.find('.loadingSquare').exists()).toBe(false)
    })

    it('keeps the loading animation inside the desktop', async () => {
      wrapper.findComponent(DesktopFileIcon).vm.$emit('openFile')
      for (let t = 0; t < 500; t += 50) {
        vi.advanceTimersByTime(50)
        await nextTick()
        const square = wrapper.find('.loadingSquare')
        if (!square.exists()) break
        const style = (square.element as HTMLElement).style
        expect(parseFloat(style.width)).toBeLessThanOrEqual(1000 - 125)
        expect(parseFloat(style.height)).toBeLessThanOrEqual(800 - 100)
      }
    })

    it('closes the resume immediately, without the animation', async () => {
      wrapper.findComponent(DesktopFileIcon).vm.$emit('openFile')
      vi.advanceTimersByTime(1000)
      await nextTick()

      await wrapper.find('.dialog.resume .button-container button').trigger('click')
      expect(isOpen(wrapper, 'resume')).toBe(false)
      expect(wrapper.find('.loadingSquare').exists()).toBe(false)
      expect(wrapper.findComponent(NavBar).props('isInFile')).toBe(false)
    })
  })
})
