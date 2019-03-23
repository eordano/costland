import React, { Component, JSXElementConstructor } from 'react';
import logo from './logo.svg';
import './App.css';

import manaAbi from './abi/mana.json'
import costAbi from './abi/cost.json'

const manaAddress = '0x2a8Fd99c19271F4F04B1B7b9c4f7cF264b626eDB'
const costAddress = ''

import 'decentraland-ui/lib/styles.css'
import Navbar from './components/Navbar'
import { Tabs, Container, Header, SignIn, Loader, Mana, Segment, Button, Input } from 'decentraland-ui';
import ParcelMap from './components/ParcelMap';
import { RequestManager, Contract, eth } from 'eth-connect'
import { number } from 'prop-types';

declare global {
  interface Window { ethereum: any; web3: any }
}

function Left(props: { children: any }) {
  return <div className='left'>{props.children}</div>
}
function Right(props: { children: any }) {
  return <div className='right'>{props.children}</div>
}

function mockStrategy(x:number, y: number) {
  return '#' + (16+x*8).toString(16) + (8*y+16).toString() + '55'
}
function onlyAFew(x:number, y: number) {
  if (!(x == 3 && y == 2) && !(x == 2 && y == 1))
  return '#ccc'
  return '#' + (16+x*8).toString(16) + (8*y+16).toString() + '55'
}

interface OwnerInfo {
  address: string
}

type Pages = 'signin' | 'market' | 'myprop' | 'loading'

interface AppState {
  signingState: any
  currentPage: Pages
  authorized: boolean
  loadProgress: number
  address?: string
  currentParcel?: { x: number, y: number }
  manaBalance?: number
  parcels: { [x: number]: { [y: number]: ParcelInfo } }
  owners: { [address: string ]: OwnerInfo },
  ethConnect: RequestManager | null
}

interface ParcelInfo {
  x: number
  y: number
  owner?: string
  price?: number
  startDate?: string | any

  taxDue?: number
  ownerMana?: number
  ownerDebt?: number
  gracePeriod?: string | any

  currentAddress: string
  bidPrice?: number
}

function renderParcelInfo(props: ParcelInfo): any {
  if (!props.owner) {
    return <div>
      <h1>Parcel {props.x}, {props.y}</h1>
      <p>Unoccupied</p>
      <div>
        <input value={4000}></input>
        <button>Buy Parcel</button>
      </div>
    </div>
  }
  return <div>
    <h1>Parcel {props.x}, {props.y}</h1>
    <p>
      <Segment><Header>Owner</Header><Header sub>{props.owner}</Header></Segment>
      <Segment><Header>Price</Header><Header sub><Mana>{props.price}</Mana></Header></Segment>
      <Segment><Header>Owned since</Header><Header sub>{props.startDate}</Header></Segment>
    </p>

    <p>
      <Segment><Header>Taxes due</Header><Header sub>{props.taxDue}</Header></Segment>
      <Segment><Header>Owner's reserves</Header><Header sub>{props.ownerMana}</Header></Segment>
      <Segment><Header>Owner total due</Header><Header sub>{props.ownerDebt}</Header></Segment>
      <Segment><Header>Grace Period Length</Header><Header sub>{props.gracePeriod}</Header></Segment>
    </p>
    {
      (props.owner !== props.currentAddress) ? <Segment>
        <p>
        <Button>Collect tax</Button>
        </p>
        { props.bidPrice
          ? <div>There's a current bid for {props.bidPrice} MANA</div> 
          : <div>
            <input value={props.price! * 1.05}></input>
            <button>Bid on Parcel</button>
          </div>
        }
      </Segment>
      : <Segment>
        <p>You own this parcel.</p>
        { props.bidPrice
          ? <div>
            There's a current bid for {props.bidPrice} MANA
            <button>Dispute</button>
            <button>Forfeit property</button>
          </div> 
          : <div>
            <Segment>
            <Input value={props.price}></Input>
            <Button>Change parcel's value</Button>
            </Segment>
            <Segment>
            <Button>Forfeit property</Button>
            </Segment>
          </div>
        }
      </Segment>
    }
  </div>
}

class App extends Component<any, AppState> {
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
        return this.renderMarket()
      case 'myprop':
        return this.renderMyProp()
    }
  }

  show(x: number, y: number) {
    this.setState({
      currentParcel: { x, y }
    })
  }

  renderMarket() {
    return <Container>
      <Left>
        <ParcelMap minX={0} maxX={5} minY={0} maxY={5} colorStrategy={mockStrategy} onClick={(x: number, y: number) => this.show(x, y)}/>
      </Left>
      <Right>
        { this.state.currentParcel ?
          this.renderParcelContext(this.state.currentParcel)
          : this.renderMarketPlaceholder()
        }
      </Right>
    </Container>
  }

  renderParcelContext(parcel: { x: number, y: number }) {
    // this.state.parcels[parcel.x][parcel.y])
    const fakeData = {
      x: parcel.x,
      y: parcel.y, owner: '0x739593b8ff80536a72d04ce13e2e5ad7c1b867d3',
      price: 23423,
      startDate: 'Aug 8th, 2018',
      taxDue: 32,
      ownerMana: 123123,
      ownerDebt: 344,
      gracePeriod: '1 week',
      currentAddress: this.state.address!,
      bidPrice: 0
    }
    return renderParcelInfo(fakeData)
  }

  renderMarketPlaceholder() {
    return <div className='Explain'>
      <p><strong>CryptoValley</strong> is a district in Decentraland's Genesis City where access to LAND is based on a COST model for property exploitation.</p>
      <p><strong>LAND</strong> in a region of this district is <strong>always for sale</strong> if you bid a higher value than the current valuation for a LAND parcel.</p>
      <p>Some ideas on different configurations that came up while developing the prototype are:</p>
      <ul>
        <li>Whether the price of the property should be charged initially.</li>
        <li>A grace period (minimum 1 day, maximum 2 years) equivalent to seven times the amount of time the owner has held ownership of the property, that allows the owner to respond to a buyer by increasing the value of their property.</li>
      </ul> 
      <div className='degrade'>
        <div style={{'display': 'flex', 'justifyContent': 'space-between', 'flexDirection': 'row'}}>
          <div><Mana>10000</Mana></div>
          <div><Mana>200</Mana></div>
        </div>
        <ParcelMap minX={0} maxX={1} minY={0} maxY={6} colorStrategy={mockStrategy} />
      </div>
    </div>
  }

  renderMyProp() {
    return <Container>
      <Left>
        <ParcelMap minX={0} maxX={5} minY={0} maxY={5} colorStrategy={onlyAFew} />
      </Left>
      <Right>
        {this.state.currentParcel
          ? this.renderParcelContext(this.state.currentParcel)
          : this.renderMyPropGen()
        }
      </Right>
    </Container>
  }

  renderMyPropGen() {
    if (!this.state.authorized) {
      return <div>
        <h3>Authorize the contract to operate MANA on your behalf</h3>
        <button>Send Authorization</button>
      </div>
    }
    const myParcels = [{ x: 3, y: 2, price: 1200}, { x: 2, y: 1, price: 324}]
    return <div className='proper'>
      <Segment>
        <Header>Owned Parcels</Header>
        <ul>
          {
            myParcels.map(parcel => <li key={`${parcel.x}.${parcel.y}`}>{`${parcel.x}, ${parcel.y}: ${parcel.price} MANA`}</li>)
          }
        </ul>
      </Segment>
      <Segment>
        <Header>Your Balance</Header><Header sub><Mana>12354</Mana></Header>
        <Header>Taxes Due</Header><Header sub><Mana>8354</Mana></Header>
        <Button primary>Pay Tax</Button>
      </Segment>
    </div>
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
