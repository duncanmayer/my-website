import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import DesktopFileIcon from '../DesktopContent/DesktopFileIcon.vue'

const bounds = { width: 1000, height: 800, top: 0, left: 0, right: 1000, bottom: 800 }
const ICON_W = 60
const ICON_H = 70
const NAV_BAR_HEIGHT = 25
const MARGIN = 1
const DOUBLE_CLICK_WINDOW_MS = 200

const mouse = (type: string, clientX: number, clientY: number) =>
  new MouseEvent(type, { clientX, clientY, bubbles: true })

function mountIcon() {
  return mount(DesktopFileIcon, {
    props: { fileName: 'DuncanResume.pdf', bounds },
    attachTo: document.body
  })
}

// Grab the icon at (fromX, fromY) and move the mouse to (toX, toY).
// The icon starts at (20, 40).
async function drag(wrapper: VueWrapper, fromX: number, fromY: number, toX: number, toY: number) {
  wrapper.element.dispatchEvent(mouse('mousedown', fromX, fromY))
  document.dispatchEvent(mouse('mousemove', toX, toY))
  await nextTick()
}

// The drag math lives in component state; the icon is rendered at a fixed spot
const dragPosition = (wrapper: VueWrapper) => (wrapper.vm as any).position

describe('DesktopFileIcon', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      width: ICON_W,
      height: ICON_H
    } as DOMRect)
  })

  afterEach(() => {
    wrapper?.unmount()
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('shows the file name', () => {
    wrapper = mountIcon()
    expect(wrapper.find('.file-name-text').text()).toBe('DuncanResume.pdf')
  })

  it('renders at its fixed desktop spot', () => {
    wrapper = mountIcon()
    const el = wrapper.element as HTMLElement
    expect({ left: el.style.left, top: el.style.top }).toEqual({ left: '20px', top: '40px' })
  })

  describe('bounds clamping while dragging', () => {
    const minX = 2
    const maxX = bounds.right - bounds.left - ICON_W - 2 * MARGIN
    const minY = NAV_BAR_HEIGHT + MARGIN
    const maxY = bounds.bottom - bounds.top - ICON_H - 2 * MARGIN

    it('follows the mouse inside the desktop', async () => {
      wrapper = mountIcon()
      await drag(wrapper, 30, 50, 330, 250) // grab offset (10, 10)
      expect(dragPosition(wrapper)).toEqual({ x: 320, y: 240 })
    })

    it('stops at the left edge', async () => {
      wrapper = mountIcon()
      await drag(wrapper, 30, 50, -500, 250)
      expect(dragPosition(wrapper).x).toBe(minX)
    })

    it('stops at the right edge', async () => {
      wrapper = mountIcon()
      await drag(wrapper, 30, 50, 5000, 250)
      expect(dragPosition(wrapper).x).toBe(maxX)
    })

    it('stops below the nav bar', async () => {
      wrapper = mountIcon()
      await drag(wrapper, 30, 50, 330, -500)
      expect(dragPosition(wrapper).y).toBe(minY)
    })

    it('stops at the bottom edge', async () => {
      wrapper = mountIcon()
      await drag(wrapper, 30, 50, 330, 5000)
      expect(dragPosition(wrapper).y).toBe(maxY)
    })

    it('stops following the mouse after mouseup', async () => {
      wrapper = mountIcon()
      await drag(wrapper, 30, 50, 330, 250)
      document.dispatchEvent(mouse('mouseup', 330, 250))
      document.dispatchEvent(mouse('mousemove', 700, 700))
      await nextTick()
      expect(dragPosition(wrapper)).toEqual({ x: 320, y: 240 })
    })

    it('highlights the file name while dragging', async () => {
      wrapper = mountIcon()
      await drag(wrapper, 30, 50, 330, 250)
      expect(wrapper.find('.file-name-wrapper').classes()).toContain('highlighted')
    })
  })

  describe('click handling', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    it('highlights on a single click without opening the file', async () => {
      wrapper = mountIcon()
      await wrapper.trigger('click')
      vi.advanceTimersByTime(DOUBLE_CLICK_WINDOW_MS)
      await nextTick()

      expect(wrapper.find('.file-name-wrapper').classes()).toContain('highlighted')
      expect(wrapper.emitted('openFile')).toBeUndefined()
    })

    it('opens the file on two clicks inside the double-click window', async () => {
      wrapper = mountIcon()
      await wrapper.trigger('click')
      vi.advanceTimersByTime(DOUBLE_CLICK_WINDOW_MS - 50)
      await wrapper.trigger('click')
      vi.advanceTimersByTime(50)

      expect(wrapper.emitted('openFile')).toHaveLength(1)
    })

    it('treats two slow clicks as two single clicks', async () => {
      wrapper = mountIcon()
      await wrapper.trigger('click')
      vi.advanceTimersByTime(DOUBLE_CLICK_WINDOW_MS + 10)
      await wrapper.trigger('click')
      vi.advanceTimersByTime(DOUBLE_CLICK_WINDOW_MS + 10)

      expect(wrapper.emitted('openFile')).toBeUndefined()
    })

    it('opens the file only once for a triple click', async () => {
      wrapper = mountIcon()
      await wrapper.trigger('click')
      await wrapper.trigger('click')
      await wrapper.trigger('click')
      vi.advanceTimersByTime(DOUBLE_CLICK_WINDOW_MS)

      expect(wrapper.emitted('openFile')).toHaveLength(1)
    })

    it('resets so a later double click opens the file again', async () => {
      wrapper = mountIcon()
      for (let i = 0; i < 2; i++) {
        await wrapper.trigger('click')
        await wrapper.trigger('click')
        vi.advanceTimersByTime(DOUBLE_CLICK_WINDOW_MS)
      }
      expect(wrapper.emitted('openFile')).toHaveLength(2)
    })

    it('removes the highlight when clicking elsewhere on the page', async () => {
      wrapper = mountIcon()
      await wrapper.trigger('click')
      vi.advanceTimersByTime(DOUBLE_CLICK_WINDOW_MS)
      await nextTick()

      document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await nextTick()
      expect(wrapper.find('.file-name-wrapper').classes()).not.toContain('highlighted')
    })
  })

  it('removes its document listeners when unmounted', () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener')
    wrapper = mountIcon()
    wrapper.unmount()
    const removed = removeSpy.mock.calls.map(([type]) => type)
    expect(removed).toEqual(expect.arrayContaining(['click', 'mousemove', 'mouseup']))
  })
})
