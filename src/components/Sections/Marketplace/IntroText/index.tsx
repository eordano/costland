import React from 'react'

import ParcelMap from "../../../ParcelMap";
import { Mana } from 'decentraland-ui';

export function mockStrategy(x:number, y: number) {
  return '#' + (16+x*8).toString(16) + (8*y+16).toString() + '55'
}

export default function renderMarketPlaceholder() {
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
