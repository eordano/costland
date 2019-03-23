import React from 'react'
import { Segment, Header, Button, Mana } from 'decentraland-ui';
import { GlobalState } from '../../../../logic/GlobalState';

export default function renderOwnerSummary(state: GlobalState) {
    if (!state.authorized) {
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