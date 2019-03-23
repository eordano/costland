import React, { Component } from 'react'

import './Map.css'

interface MapProps {
    minX: number
    maxX: number
    minY: number
    maxY: number
    colorStrategy: (x: number, y: number) => string
    highlight?: { x: number, y: number } | undefined
    onClick?: (x: number, y: number) => any
}

export class Map extends Component<MapProps> {
  render() {
    const xRange: number[] = []
    for (let i = this.props.minX; i < this.props.maxX; i++) {
        xRange.push(i)
    }
    const yRange: number[] = []
    for (let i = this.props.minY; i < this.props.maxY; i++) {
        yRange.push(i)
    }
    const elements = xRange.map(
      x => yRange.map(
          y => <div key={`${x}.${y}`} onClick={this.props.onClick ? () => this.props.onClick!(x, y) : (() => null)} className='parcel' style={{
            'cursor': 'pointer',
              'backgroundColor': this.props.colorStrategy(x, y),
              'border': (this.props.highlight && this.props.highlight.x === x && this.props.highlight.y === y) ? '3px solid black' : 'none'
              }} />
      )
    )
    return <div className='mapContainer'>{ elements.map((e,i) => <div key={i} className='parcelRow'>{e}</div>) }</div>
  }
}
