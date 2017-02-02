'use babel'

import path from 'path'

import StatusBarView from './status-bar-view'
import { Disposable, CompositeDisposable } from 'atom'

function sanitize(config) {
  if (!config) return []
  return config.filter(c => c)
}

class GitPear {
  activePair = {
    author: null,
    committer: null,
  }

  activate(state) {
    this.subscriptions = new CompositeDisposable()
    this.availablePairs = []
    this.statusBarView = new StatusBarView(this.setGitUser.bind(this))
    this.subscriptions.add(
      atom.config.observe('git-pear.pairs', value => {
        this.setAvailablePairs(sanitize(value))
      }),
      new Disposable(() => this.statusBarView.destroy())
    )
    if (state && state.activePair) {
      Object.keys(state.activePair).forEach(type => {
        if (state.activePair[type]) {
          this.setGitUser(type, state.activePair[type])
          this.statusBarView.setActivePair(type, state.activePair[type])
        }
      })
    }
  }

  serialize() {
    return {
      activePair: this.activePair,
    }
  }

  consumeStatusBar(statusBar) {
    this.statusBarTile = statusBar.addRightTile({item: this.statusBarView})
    this.subscriptions.add(
      new Disposable(() => this.statusBarTile.destroy())
    )
  }

  setAvailablePairs(strings) {
    this.availablePairs = strings.map(str => {
      const [name, email] = str.split(';')
      return {
        name: name,
        email: email,
      }
    })
    this.statusBarView.setAvailablePairs(this.availablePairs)
  }

  setGitUser(type, pairEntry) {
    const prefix = type === 'author' ? 'GIT_AUTHOR' : 'GIT_COMMITTER'
    if (pairEntry) {
      process.env[`${prefix}_NAME`] = pairEntry.name
      process.env[`${prefix}_EMAIL`] = pairEntry.email
    } else {
      delete process.env[`${prefix}_NAME`]
      delete process.env[`${prefix}_EMAIL`]
    }
    this.activePair[type] = pairEntry || null
  }

  deactive(state) {
  }
}

module.exports = new GitPear()
