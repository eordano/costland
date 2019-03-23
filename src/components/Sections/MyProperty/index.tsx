import React from 'react';
import { Container } from 'decentraland-ui';

import ParcelMap from '../../ParcelMap';
import { Left } from '../../Left';
import { Right } from '../../Right';
import { onlyAFew } from '../../../App';
import { default as ownerSummary } from './OwnerSummary'
import drawOwnedParcel, { default as renderParcelInfo } from './Parcel';
import { GlobalState } from '../../../logic/GlobalState';
import { getInfo } from '../../../logic/ParcelInfo';

export function MyPropertyPanel(state: GlobalState, onParcelClick: (x: number, y: number) => any) {
  return <Container>
    <Left>
      <ParcelMap minX={0} maxX={5} minY={0} maxY={5} colorStrategy={onlyAFew} onClick={onParcelClick} />
    </Left>
    <Right>
      {state.currentParcel
        ? drawOwnedParcel(getInfo(state, state.currentParcel))
        : ownerSummary(state)}
    </Right>
  </Container>;
}
