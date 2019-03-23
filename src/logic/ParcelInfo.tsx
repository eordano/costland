import { GlobalState } from "./GlobalState";

export interface ParcelInfo {
  x: number;
  y: number;
  owner?: string;
  price?: number;
  startDate?: string | any;
  taxDue?: number;
  ownerMana?: number;
  ownerDebt?: number;
  gracePeriod?: string | any;
  currentAddress: string;
  bidPrice?: number;
}

export function getInfo(globalState: GlobalState, parcel: { x: number, y: number }) {
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
      currentAddress: globalState.address!,
      bidPrice: 0
    }
    return fakeData
  }