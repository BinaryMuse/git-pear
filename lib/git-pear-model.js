'use babel'

import { Emitter } from 'atom'

let instance
export default class GitPearModel {
  currentPair = {
    author: null,
    committer: null,
  }

  availablePairs = []

  static get instance() {
    if (!instance) {
      instance = new GitPearModel()
    }
    return instance
  }

  constructor() {
    this.emitter = new Emitter()
  }

  restoreFromSavedState(savedPair) {
    setTimeout(() => {
      Object.keys(savedPair).forEach(type => {
        if (savedPair[type]) {
          this.setPairRole(type, savedPair[type])
        }
      })
    }, 2000)
  }

  setPairRole(type, user) {
    const prefix = type === 'author' ? 'GIT_AUTHOR' : 'GIT_COMMITTER'
    if (user) {
      process.env[`${prefix}_NAME`] = user.name
      process.env[`${prefix}_EMAIL`] = user.email
    } else {
      delete process.env[`${prefix}_NAME`]
      delete process.env[`${prefix}_EMAIL`]
    }
    this.currentPair[type] = user || null
    this.didUpdate()
  }

  setAvailablePairs(settingStrings) {
    this.availablePairs = settingStrings.filter(s => s.indexOf(';') > -1).map(str => {
      const [name, email] = str.split(';')
      return {
        name: name,
        email: email,
      }
    })
    this.didUpdate()
  }

  getCurrentPair() {
    return {
      author: Object.assign({}, this.currentPair.author),
      committer: Object.assign({}, this.currentPair.committer),
    }
  }

  getAvailablePairs() {
    return this.availablePairs
  }

  didUpdate() {
    this.emitter.emit('did-update')
  }

  onDidUpdate(callback) {
    return this.emitter.on('did-update', callback)
  }

  destroy() {
    this.emitter.dispose()
  }
}
