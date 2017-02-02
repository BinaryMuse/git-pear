'use babel'

import {remote} from 'electron'
const {Menu, MenuItem} = remote

export default class StatusBarView {
  activePair = {
    author: null,
    committer: null,
  }

  constructor(onSetActivePair) {
    this.onSetActivePair = onSetActivePair

    this.element = document.createElement('div')
    this.element.classList.add('git-pear-status-bar')
    this.element.textContent = '🍐'
    this.updateContent()
    this.setAvailablePairs([])
    this.showMenu = this.showMenu.bind(this)
    this.element.addEventListener('click', this.showMenu)
  }

  updateContent() {
    let content = this.activePair.author ? this.getInitials(this.activePair.author.name) : '<default>'
    content += ';'
    content += this.activePair.committer ? this.getInitials(this.activePair.committer.name) : '<default>'
    this.element.textContent = `🍐 ${content}`
  }

  getInitials(name) {
    return name.split(' ').map(s => s.trim()).map(s => s.substr(0, 1)).join('').toLowerCase()
  }

  setAvailablePairs(pairs) {
    this.menu = Menu.buildFromTemplate([
      {
        label: 'Set Git Author',
        enabled: pairs.length,
        submenu: pairs.map(pair => ({
          label: `${pair.name} <${pair.email}>`,
          click: () => {
            this.setActivePair('author', pair)
          }
        }))
      },
      {
        label: 'Set Git Committer',
        enabled: pairs.length,
        submenu: pairs.map(pair => ({
          label: `${pair.name} <${pair.email}>`,
          click: () => {
            this.setActivePair('committer', pair)
          }
        }))
      },
      {
        type: 'separator'
      },
      {
        label: "Clear",
        click: () => {
          this.setActivePair('author', null)
          this.setActivePair('committer', null)
        }
      }
    ])
  }

  setActivePair(type, pair) {
    this.onSetActivePair(type, pair)
    this.activePair[type] = pair
    this.updateContent()
  }

  showMenu() {
    this.menu.popup()
  }

  destroy() {
    this.element.removeEventListener('click', this.showMenu)
    this.element.remove()
  }
}
