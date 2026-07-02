import { isVoid } from "../util.js";

export const PRIVS = {
  FLOS: { short: "FLOS", long: "Flos Tramway",                 price:20,  dividend:5,  bg:'tan',   fg:'black',  x:0 },
  WS:   { short: "W&S",  long: "Waterloo & Sawgreen",          price:40,  dividend:10, bg:'purple',fg:'white',  x:1 },
  CAN:  { short: "CAN",  long: "Canada Company",               price:50,  dividend:10, bg:'red',   fg:'white',  x:2 },
  GLS:  { short: "GLS",  long: "Great Lakes Shipping Company", price:70,  dividend:15, bg:'blue',  fg:'white',  x:3 },
  NIAG: { short: "NIAG", long: "Niagara Falls Bridge Company", price:100, dividend:20, bg:'aqua',  fg:'black',  x:4 },
  STC:  { short: "ST.C", long: "St. Claire Tunnel Company",    price:100, dividend:20, bg:'gray',  fg:'yellow', x:5 },
  SOLD: { short: "SOLD", long: "SOLD",                         bg: 'lightgray', fg:'black'}
}

export const STOCKS = {
  BBG: { short: "BBG", bg: 'pink',    fg: 'black' },
  CA:  { short: "CA",  bg: 'red',     fg: 'white'},
  CPR: { short: "CPR", bg: 'violet',  fg: 'black'},
  CV:  { short: "CV",  bg: 'purple',  fg: 'white'},
  GT:  { short: "GT",  bg: '#7BE1BF', fg: 'black'},
  GW:  { short: "GW",  bg: 'tan',     fg: 'black'},
  LPS: { short: "LPS", bg: '#479BF9', fg: 'black'},
  TGB: { short: "TGB", bg: '#FF4500', fg: 'black'},
  THB: { short: "THB", bg: '#FFEF00', fg: 'black'},
  WGB: { short: "WGB", bg: '#342D7E', fg: 'white'},
  WR:  { short: "WR",  bg: '#8F6839', fg: 'white'},
  CGR: { short: "CGR", bg: 'white',   fg: 'black'},
  TRAIN: { short: "D", bg: "gray",    fg: 'black'},
  CASH: { short:"$$$", bg: 'lightgreen', fg: 'black' }
};


export function privCert(name, ht) {
  var priv = PRIVS[name];
  return svgCert(ht, priv.short, priv.fg, 2, "black", priv.bg)
}

export function stockNameCert(name, ht) {
  var stk = STOCKS[name];
  if (isVoid(stk)) return svgCert(ht, name, 'white', 2, "black", 'black')
  return svgCert(ht, stk.short, stk.fg, 2, "black", stk.bg)
}

export function countedStockCert(name, ht, count, bThick, bColor) {
  var stk = STOCKS[name];
  return svgCert(ht, count, stk.fg, bThick, bColor, stk.bg)
}

export function svgCert(ht, txt, tColor, bThick, bColor, bg) {
  return <svg xmlns="http://www.w3.org/2000/svg" height={ht} viewBox="0 0 95 70"><g>
    <path d="M 10 10 l 75 0 0 50 -75 0 0 -50" fill={bg} stroke-width={bThick} stroke={bColor} />
    <text x="50%" y="53%" text-anchor="middle" dominant-baseline="middle" font-size="28px" fill={tColor}>{txt}</text>
  </g></svg>
}
