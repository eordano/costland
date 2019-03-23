import { RequestManager } from 'eth-connect';

import { OwnerInfo } from './OwnerInfo';

import { ParcelInfo } from './ParcelInfo';

export type Pages = 'signin' | 'market' | 'myprop' | 'loading'

export interface GlobalState {
  signingState: any;
  currentPage: Pages;
  authorized: boolean;
  loadProgress: number;
  address?: string;
  currentParcel?: {
    x: number;
    y: number;
  };
  manaBalance?: number;
  parcels: {
    [x: number]: {
      [y: number]: ParcelInfo;
    };
  };
  owners: {
    [address: string]: OwnerInfo;
  };
  ethConnect: RequestManager | null;
}
