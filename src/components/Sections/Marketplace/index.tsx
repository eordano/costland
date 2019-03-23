import React from 'react';
import { Container } from 'decentraland-ui';
import ParcelMap from '../../ParcelMap';
import { Left } from '../../Left';
import { Right } from '../../Right';

import renderMarketIntro, { mockStrategy } from './IntroText'
import { GlobalState } from '../../../logic/GlobalState';
import { renderParcelInfo } from './MarketParcelContext';
import { getInfo } from '../../../logic/ParcelInfo';

export function MarketSection(state: GlobalState, show: (x: number, y: number) => any) {
  return <Container>
    <Left>
      <ParcelMap minX={0} maxX={5} minY={0} maxY={5} colorStrategy={mockStrategy} onClick={show} />
    </Left>
    <Right>
      {state.currentParcel ?
        renderParcelInfo(getInfo(state, state.currentParcel))
        : renderMarketIntro()
      }
    </Right>
  </Container>
}
