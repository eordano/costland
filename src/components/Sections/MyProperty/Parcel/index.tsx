import React from 'react'

import { ParcelInfo } from '../../../../logic/ParcelInfo'

export default function drawOwnedParcel(
  info: ParcelInfo
) {
  return <div>{info.x}, {info.y}</div>
}