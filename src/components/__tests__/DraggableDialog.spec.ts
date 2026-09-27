import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import DraggableDialog from '../DraggableDialog.vue'

// 1000x800 desktop. The dialog measures itself as 500x400 (the default CSS size).
const bounds = { width: 1000, height: 800, top: 0, left: 0, right: 1000, bottom: 800 }
const DIALOG_W = 500
const DIALOG_H = 400
const NAV_BAR_HEIGHT = 25
const MARGIN = 1

const mouse = (type: string, clientX: number, clientY: number) =>
  new MouseEvent(type, { clientX, clientY, bubbles: true })

// Grab the title bar at (fromX, fromY), then move the mouse to (toX, toY)
async function drag(wrapper: VueWrapper, fromX: number, fromY: number, toX: number, toY: number) {
  wrapper.find('.dialog-header').element.dispatchEvent(mouse('mousedown', fromX, fromY))
  document.dispatchEvent(mouse('mousemove', toX, toY))
  await nextTick()
}

function position(wrapper: VueWrapper) {
  const el = wrapper.find('.dialog').element as HTMLElement
  return { x: parseFloat(el.style.left), y: parseFloat(el.style.top) }
}

function mountDialog(props = {}) {
  return mount(DraggableDialog, {
    props: { isVisible: true, title: 'Welcome', bounds, dialogClass: 'welcome', ...props },
    attachTo: document.body
  })
}

describe('DraggableDialog', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      width: DIALOG_W,
      height: DIALOG_H
    } as DOMRect)
    // run animation-frame callbacks immediately so expand() is synchronous
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      cb(0)
      return 0
    })
  })

  afterEach(() => {
    wrapper?.unmount()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  describe('rendering', () => {
    it('renders the title and slot content when visible', () => {
      wrapper = mount(DraggableDialog, {
        props: { isVisible: true, title: 'Hello', bounds, dialogClass: 'welcome' },
        slots: { default: '<p class="body">content</p>' }
      })
      expect(wrapper.find('h2').text()).toBe('Hello')
      expect(wrapper.find('.body').exists()).toBe(true)
      expect(wrapper.classes()).toContain('welcome')
    })

    it('renders nothing when not visible', () => {
      wrapper = mountDialog({ isVisible: false })
      expect(wrapper.find('.dialog').exists()).toBe(false)
    })

    it('emits close when the X button is clicked', async () => {
      wrapper = mountDialog()
      await wrapper.findAll('.button-container button')[0].trigger('click')
      expect(wrapper.emitted('close')).toHaveLength(1)
    })
  })

  describe('initial placement', () => {
    it('places the welcome dialog relative to the desktop size', () => {
      wrapper = mountDialog()
      expect(position(wrapper)).toEqual({ x: 0.15 * bounds.width, y: 0.19 * bounds.height })
    })

    it('places the contact dialog relative to the desktop size', () => {
      wrapper = mountDialog({ dialogClass: 'contact' })
      expect(position(wrapper)).toEqual({ x: 0.37 * bounds.width, y: 0.1 * bounds.height })
    })

    it('uses the default spot for dialog types without a computed position', () => {
      wrapper = mountDialog({ dialogClass: 'review' })
      expect(position(wrapper)).toEqual({ x: 150, y: 100 })
    })

    it('uses the new desktop size the next time the dialog opens after a resize', async () => {
      wrapper = mountDialog()
      const resized = { width: 2000, height: 1000, top: 0, left: 0, right: 2000, bottom: 1000 }
      await wrapper.setProps({ bounds: resized })
      await wrapper.setProps({ isVisible: false })
      await wrapper.setProps({ isVisible: true })
      expect(position(wrapper)).toEqual({ x: 0.15 * 2000, y: 0.19 * 1000 })
    })

    // position and positionByType[dialogClass] are the same object, so a drag
    // also updates the spot the dialog reopens at
    it('reopens where it was last dragged to', async () => {
      wrapper = mountDialog({ dialogClass: 'review' })
      await drag(wrapper, 160, 110, 400, 300)
      expect(position(wrapper)).toEqual({ x: 390, y: 290 })

      await wrapper.setProps({ isVisible: false })
      await wrapper.setProps({ isVisible: true })
      expect(position(wrapper)).toEqual({ x: 390, y: 290 })
    })
  })

  describe('dragging', () => {
    it('follows the mouse, keeping the grab offset', async () => {
      wrapper = mountDialog({ dialogClass: 'review' }) // starts at (150, 100)
      // grab 10px right / 8px down from the corner, move the mouse to (310, 260)
      await drag(wrapper, 160, 108, 310, 260)
      expect(position(wrapper)).toEqual({ x: 300, y: 252 })
    })

    it('also drags when grabbed by the body, not just the title bar', async () => {
      wrapper = mountDialog({ dialogClass: 'review' })
      wrapper.find('.dialog').element.dispatchEvent(mouse('mousedown', 160, 108))
      document.dispatchEvent(mouse('mousemove', 310, 260))
      await nextTick()
      expect(position(wrapper)).toEqual({ x: 300, y: 252 })
    })

    it('stops following the mouse after mouseup', async () => {
      wrapper = mountDialog({ dialogClass: 'review' })
      await drag(wrapper, 160, 108, 310, 260)
      document.dispatchEvent(mouse('mouseup', 310, 260))
      document.dispatchEvent(mouse('mousemove', 600, 350))
      await nextTick()
      expect(position(wrapper)).toEqual({ x: 300, y: 252 })
    })

    it('does not move on mousemove without a mousedown first', async () => {
      wrapper = mountDialog({ dialogClass: 'review' })
      document.dispatchEvent(mouse('mousemove', 600, 350))
      await nextTick()
      expect(position(wrapper)).toEqual({ x: 150, y: 100 })
    })
  })

  describe('bounds clamping while dragging', () => {
    const minX = 2 * MARGIN
    const maxX = bounds.right - bounds.left - DIALOG_W - 2 * MARGIN
    const minY = NAV_BAR_HEIGHT + MARGIN
    const maxY = bounds.bottom - bounds.top - DIALOG_H - 2 * MARGIN

    it('stops at the left edge', async () => {
      wrapper = mountDialog({ dialogClass: 'review' })
      await drag(wrapper, 160, 108, -500, 260)
      expect(position(wrapper).x).toBe(minX)
    })

    it('stops at the right edge so the whole dialog stays visible', async () => {
      wrapper = mountDialog({ dialogClass: 'review' })
      await drag(wrapper, 160, 108, 5000, 260)
      expect(position(wrapper).x).toBe(maxX)
    })

    it('stops below the nav bar instead of sliding under it', async () => {
      wrapper = mountDialog({ dialogClass: 'review' })
      await drag(wrapper, 160, 108, 310, -500)
      expect(position(wrapper).y).toBe(minY)
    })

    it('stops at the bottom edge', async () => {
      wrapper = mountDialog({ dialogClass: 'review' })
      await drag(wrapper, 160, 108, 310, 5000)
      expect(position(wrapper).y).toBe(maxY)
    })

    it('clamps both axes at once when dragged past a corner', async () => {
      wrapper = mountDialog({ dialogClass: 'review' })
      await drag(wrapper, 160, 108, 9999, 9999)
      expect(position(wrapper)).toEqual({ x: maxX, y: maxY })

      await drag(wrapper, maxX + 10, maxY + 8, -9999, -9999)
      expect(position(wrapper)).toEqual({ x: minX, y: minY })
    })

    it('allows the exact edge values without nudging them', async () => {
      wrapper = mountDialog({ dialogClass: 'review' })
      // offset is (10, 8), so these mouse positions land exactly on the limits
      await drag(wrapper, 160, 108, maxX + 10, maxY + 8)
      expect(position(wrapper)).toEqual({ x: maxX, y: maxY })
    })

    it('respects a desktop that does not start at the page origin', async () => {
      const offset = { width: 1000, height: 800, top: 50, left: 100, right: 1100, bottom: 850 }
      wrapper = mountDialog({ dialogClass: 'review', bounds: offset })
      await drag(wrapper, 160, 108, 9999, 9999)
      // limits are based on the desktop's width/height, not its absolute right/bottom
      expect(position(wrapper)).toEqual({ x: maxX, y: maxY })
    })
  })

  describe('maximize / restore', () => {
    const expandButton = (w: VueWrapper) => w.findAll('.button-container button')[1]
    const size = (w: VueWrapper) => {
      const el = w.find('.dialog').element as HTMLElement
      return { width: el.style.width, height: el.style.height }
    }

    it('grows to 70% x 82% of the desktop', async () => {
      wrapper = mountDialog({ dialogClass: 'review' })
      await expandButton(wrapper).trigger('click')
      expect(size(wrapper)).toEqual({ width: '700px', height: '656px' })
    })

    it('keeps its position when the bigger size still fits', async () => {
      wrapper = mountDialog({ dialogClass: 'review' }) // (150, 100): 150+700 < 1000, 100+656 < 800
      await expandButton(wrapper).trigger('click')
      await nextTick()
      expect(position(wrapper)).toEqual({ x: 150, y: 100 })
    })

    it('shifts left when growing would push it past the right edge', async () => {
      wrapper = mountDialog({ dialogClass: 'review' })
      await drag(wrapper, 160, 108, 5000, 108) // pin to right edge, y stays 100
      await expandButton(wrapper).trigger('click')
      await nextTick()
      // 1000 - 700 - 25 margin
      expect(position(wrapper)).toEqual({ x: 275, y: 100 })
    })

    it('shifts up when growing would push it past the bottom edge', async () => {
      wrapper = mountDialog({ dialogClass: 'review' })
      await drag(wrapper, 160, 108, 160, 5000) // pin to bottom edge, x stays 150
      await expandButton(wrapper).trigger('click')
      await nextTick()
      // 800 - 656 - 25 margin
      expect(position(wrapper)).toEqual({ x: 150, y: 119 })
    })

    it('shifts on both axes when maximized from the bottom-right corner', async () => {
      wrapper = mountDialog({ dialogClass: 'review' })
      await drag(wrapper, 160, 108, 9999, 9999)
      await expandButton(wrapper).trigger('click')
      await nextTick()
      expect(position(wrapper)).toEqual({ x: 275, y: 119 })
    })

    it('shrinks to 60% x 72% of the desktop on the second click, without moving', async () => {
      wrapper = mountDialog({ dialogClass: 'review' })
      await drag(wrapper, 160, 108, 9999, 9999)
      await expandButton(wrapper).trigger('click')
      await nextTick()
      const afterExpand = position(wrapper)

      await expandButton(wrapper).trigger('click')
      await nextTick()
      expect(size(wrapper)).toEqual({ width: '600px', height: '576px' })
      expect(position(wrapper)).toEqual(afterExpand)
    })

    it('alternates between maximized and restored on repeated clicks', async () => {
      wrapper = mountDialog({ dialogClass: 'review' })
      const sizes = []
      for (let i = 0; i < 4; i++) {
        await expandButton(wrapper).trigger('click')
        sizes.push(size(wrapper).width)
      }
      expect(sizes).toEqual(['700px', '600px', '700px', '600px'])
    })
  })

  describe('cleanup', () => {
    it('removes its document listeners when unmounted', () => {
      const removeSpy = vi.spyOn(document, 'removeEventListener')
      wrapper = mountDialog()
      wrapper.unmount()
      const removed = removeSpy.mock.calls.map(([type]) => type)
      expect(removed).toEqual(expect.arrayContaining(['mousemove', 'mouseup']))
    })
  })
})
