'use babel'

import {remote} from 'electron'
const {Menu, MenuItem} = remote

export default class StatusBarView {
  constructor(model) {
    this.model = model
    this.subscriptions = this.model.onDidUpdate(this.onModelUpdate.bind(this))

    this.element = document.createElement('div')
    this.element.classList.add('git-pear-status-bar')
    this.element.textContent = '🍐'
    this.updateStatusBarText(this.model.getCurrentPair())
    this.resetMenu(this.model.getAvailablePairs())
    this.showMenu = this.showMenu.bind(this)
    this.element.addEventListener('click', this.showMenu)
  }

  updateStatusBarText(currentPair) {
    let content = currentPair.author.name ? this.getInitials(currentPair.author.name) : '<default>'
    content += ';'
    content += currentPair.committer.name ? this.getInitials(currentPair.committer.name) : '<default>'
    this.element.textContent = `🍐 ${content}`
  }

  getInitials(name) {
    return name.split(' ').map(s => s.trim()).map(s => s.substr(0, 1)).join('').toLowerCase()
  }

  onModelUpdate() {
    this.updateStatusBarText(this.model.getCurrentPair())
    this.resetMenu(this.model.getAvailablePairs())
  }

  resetMenu(pairs) {
    const currentPair = this.model.getCurrentPair()
    this.menu = Menu.buildFromTemplate([
      {
        label: 'Set Git Author',
        enabled: pairs.length,
        submenu: pairs.map(person => ({
          type: 'radio',
          label: `${person.name} <${person.email}>`,
          checked: currentPair.author && currentPair.author.name === person.name && currentPair.author.email === person.email,
          click: () => {
            this.setPairRole('author', person)
          }
        }))
      },
      {
        label: 'Set Git Committer',
        enabled: pairs.length,
        submenu: pairs.map(person => ({
          type: 'radio',
          label: `${person.name} <${person.email}>`,
          checked: currentPair.committer && currentPair.committer.name === person.name && currentPair.committer.email === person.email,
          click: () => {
            this.setPairRole('committer', person)
          }
        }))
      },
      {
        type: 'separator'
      },
      {
        label: "Clear",
        click: () => {
          this.setPairRole('author', null)
          this.setPairRole('committer', null)
        }
      }
    ])
  }

  setPairRole(role, person) {
    this.model.setPairRole(role, person)
  }

  showMenu() {
    this.menu.popup()
  }

  destroy() {
    this.element.removeEventListener('click', this.showMenu)
    this.element.remove()
  }
}
