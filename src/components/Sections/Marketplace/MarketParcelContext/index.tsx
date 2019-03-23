import React from 'react';
import { Header, Mana, Segment, Button, Input } from 'decentraland-ui';
import { ParcelInfo } from '../../../../logic/ParcelInfo';

export function renderParcelInfo(props: ParcelInfo): any {
  if (!props.owner) {
    return <div>
      <h1>Parcel {props.x}, {props.y}</h1>
      <p>Unoccupied</p>
      <div>
        <input value={4000}></input>
        <button>Buy Parcel</button>
      </div>
    </div>;
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
    {(props.owner !== props.currentAddress) ? <Segment>
      <p>
        <Button>Collect tax</Button>
      </p>
      {props.bidPrice
        ? <div>There's a current bid for {props.bidPrice} MANA</div>
        : <div>
          <input value={props.price! * 1.05}></input>
          <button>Bid on Parcel</button>
        </div>}
    </Segment>
      : <Segment>
        <p>You own this parcel.</p>
        {props.bidPrice
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
          </div>}
      </Segment>}
  </div>;
}
