'use babel'

import path from 'path'

import StatusBarView from './status-bar-view'
import GitPearItemView from './git-pear-item-view'
import GitPearModel from './git-pear-model'
import { Disposable, CompositeDisposable } from 'atom'


class GitPear {
  activePair = {
    author: null,
    committer: null,
  }

  activate(state = {}) {
    this.availablePairs = []
    this.subscriptions = new CompositeDisposable()
    this.model = GitPearModel.instance
    this.statusBarView = new StatusBarView(this.model)

    this.subscriptions.add(
      atom.config.observe('git-pear.pairs', value => this.model.setAvailablePairs(value)),
      new Disposable(() => this.statusBarView.destroy()),
      new Disposable(() => this.model.destroy())
    )

    if (state.activePair) {
      this.model.restoreFromSavedState(state.activePair)
    }
  }

  serialize() {
    return {
      activePair: this.model.getCurrentPair(),
    }
  }

  consumeStatusBar(statusBar) {
    this.statusBarTile = statusBar.addRightTile({item: this.statusBarView})
    this.subscriptions.add(
      new Disposable(() => this.statusBarTile.destroy())
    )
  }

  deactive(state) {
    this.subscriptions.dispose()
  }
}

module.exports = new GitPear()
