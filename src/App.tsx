import React, { Component } from 'react';

import { Tabs, SignIn, Loader } from 'decentraland-ui';

import 'decentraland-ui/lib/styles.css'
import './App.css';
import Navbar from './components/Navbar/Navbar'
import { MarketSection } from './components/Sections/Marketplace';
import { MyPropertyPanel } from './components/Sections/MyProperty';
import { GlobalState, Pages } from './logic/GlobalState';
import { RequestManager } from 'eth-connect';

declare global {
  interface Window { ethereum: any; web3: any }
}

export function onlyAFew(x:number, y: number) {
  if (!(x == 3 && y == 2) && !(x == 2 && y == 1))
  return '#ccc'
  return '#' + (16+x*8).toString(16) + (8*y+16).toString() + '55'
}

class App extends Component<any, GlobalState> {
  constructor(props: any, extra: any, ...args: any[]) {
    super(props, extra)
    this.state = {
      signingState: '',
      loadProgress: 0,
      currentPage: 'signin',
      parcels: {},
      owners: {},
      authorized: true,
      ethConnect: null
    }
  }

  goto(page: Pages) {
    return () => this.setState({ currentPage: page, currentParcel: undefined })
  }

  connect() {
    return async () => {
      if (this.state.signingState === 'isConnected') {
        this.setState( { currentPage: 'loading' })
      }
      if (window.ethereum) {
        this.setState({ signingState: 'isConnecting' })
        await window.ethereum.enable()
        const ethConnect = new RequestManager(window.web3.currentProvider)
        this.setState({ ethConnect })
        const accounts = await ethConnect.eth_accounts()
        this.setState({
          address: accounts[0],
          signingState: 'isConnected',
          currentPage: 'market'
        })
        this.load()
      }
    }
  }

  async load() {
//    const ethConnect = this.state.ethConnect!
//    const mana: any = new Contract(ethConnect, manaAbi, manaAddress)
//    const cost: any = new Contract(ethConnect, costAbi, costAddress)
//
//    this.setState({ loadProgress: 1 })
//    const updateProgress = () => {
//      this.setState({ loadProgress: this.state.loadProgress + 1 })
//    }
//
//    const manaBalance = await mana.balanceOf(this.state.address!)
    this.setState({ currentPage: 'market' })
//    updateProgress()
//
  }

  renderInside() {
    switch (this.state.currentPage) {
      case 'signin':
        return <SignIn onConnect={this.connect()} isConnected={this.state.signingState === 'isConnected'} isConnecting={this.state.signingState === 'isConnecting'}/>
      case 'loading':
        return <Loader size='huge'/>
      case 'market':
        return MarketSection(this.state, (x: number, y: number) => this.show(x, y))
      case 'myprop':
        return MyPropertyPanel(this.state, (x: number, y: number) => this.show(x, y))
    }
  }

  show(x: number, y: number) {
    this.setState({
      currentParcel: { x, y }
    })
  }

  renderMarket() {
    return 
  }

  renderMyProp() {
  }

  render() {
    return (
      <div className="App">
      {
        this.state.currentPage !== 'signin' 
        &&
        <>
          <Navbar isConnected mana={this.state.manaBalance} address={this.state.address!} />
          <Tabs>
            <Tabs.Tab active={this.state.currentPage==='market'}><a href='#' onClick={this.goto('market')}>Marketplace</a></Tabs.Tab>
            <Tabs.Tab active={this.state.currentPage==='myprop'}><a href='#' onClick={this.goto('myprop')}>My Properties</a></Tabs.Tab>
          </Tabs>
        </>
      }
      { this.renderInside() }
      </div>
    );
  }
}

export default App;
