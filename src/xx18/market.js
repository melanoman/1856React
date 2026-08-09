import React, {useState, useEffect} from 'react';
import {isVoid} from '../util.js';
import {roundButton} from './button.js';
import "./market.css";

const depth = [ 11, 11, 11, 11, 11, 8, 7, 6, 6, 5, 5,  4,  4,  3,  3,  2,  2,  2,  2,  2 ]
const cols =   [ 0,  1,  2,  3,  4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]
const rows = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]

export function MarketTable(props) {
  return <table class='grid-table'>
    {rows.map(x=>MarketRow(props, x, makePriceMap(props)))}
  </table>
}

function enterCorp(corp, out) {
  if(corp.par < 65 || corp.closed) return;
  if(isVoid(out[corp.price.y][corp.price.x])) out[corp.price.y][corp.price.x] = [corp.name]
  else out[corp.price.y][corp.price.x].push(corp.name)
}

function makePriceMap(props) { //TODO for real
  var out = rows.map(x=>[])
  props.board.corps.forEach(x=> enterCorp(x, out))
  return out
}

function MarketRow(props, row, map) {
  return <tr>
    {cols.map(x=>MarketCell(props, row, x, map))}
  </tr>
}

const BG = [ 'white', 'white', 'white', 'white', 'yellow', 'yellow', 'brown', 'brown', 'brown', 'white', 'white']

function MarketCell(props, row, col, map) {
  if(depth[col] <= row) return
  var style = {}
  style["font-size"] = props.net.ht(18)+'pt';
  if (row > col) style["color"] = isVoid(map[row][col]) ? BG[row-col] : 'black';
  else style["color"] = isVoid(map[row][col]) ? 'white' : 'black';
  style["background"] = BG[row-col];
  if(col===0 && row===10) { style['border-top-color'] = 'white'; style['border-right-color'] = 'white'; }
  if(col===0 && row===9) style['border-bottom-color'] = 'white'
  if(col===1 && row===10) style['border-left-color'] = 'white'
  //TODO replace with icons
  if(isVoid(map[row][col])) return <td style={style}>XXX</td>
  return <td style={style}>{map[row][col].map(x=><div>{x}</div>)}</td>
}
