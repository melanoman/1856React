export function squareButton(f, txt, tColor, bg, ht) {
  return <button class='naked-button' onClick={f} >
    <svg height={ht} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 70"><g>
      <rect width='60' height='60' x='5' y='5' rx='10' ry='10' fill={bg} stroke-width="2" stroke="black" />
      <text x="50%" y="53%" text-anchor="middle" dominant-baseline="middle" font-size="14px" fill={tColor}>{txt}</text>
    </g></svg>
  </button>
}

export function squareButtonD(f, txt, txt2, tColor, bg, ht) {
  return <button class='naked-button' onClick={f} >
    <svg height={ht} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 70"><g>
      <rect width='60' height='60' x='5' y='5' rx='10' ry='10' fill={bg} stroke-width="2" stroke="black" />
      <text x="50%" y="38%" text-anchor="middle" dominant-baseline="middle" font-size="14px" fill={tColor}>{txt}</text>
      <text x="50%" y="70%" text-anchor="middle" dominant-baseline="middle" font-size="14px" fill={tColor}>{txt2}</text>
    </g></svg>
  </button>
}

export function roundButton(f, txt, tColor, bg, ht) {
  return <button class='naked-button' onClick={f} >
    <svg height={ht} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 70"><g>
      <circle cx='35' cy='36' r='30' fill={bg} stroke-width="2" stroke="black" />
      <text x="50%" y="53%" text-anchor="middle" dominant-baseline="middle" font-size="14px" fill={tColor}>{txt}</text>
    </g></svg>
  </button>
}

export function roundButtonD(f, txt, txt2, tColor, bg, ht) {
  return <button class='naked-button' onClick={f} >
    <svg height={ht} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 70"><g>
      <circle cx='35' cy='36' r='30' fill={bg} stroke-width="2" stroke="black" />
      <text x="50%" y="42%" text-anchor="middle" dominant-baseline="middle" font-size="14px" fill={tColor}>{txt}</text>
      <text x="50%" y="70%" text-anchor="middle" dominant-baseline="middle" font-size="14px" fill={tColor}>{txt2}</text>
    </g></svg>
  </button>
}

export function hexButtonD(f, txt, txt2, tColor, bg, ht) {
  return <button class='naked-button' onClick={f} >
    <svg height={ht} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 70"><g>
      <path d="M 18 9 l 34 0 17 28 -17 28 -34 0 -17 -28 17 -28" fill={bg} stroke-width="2" stroke="black" />
      <text x="50%" y="42%" text-anchor="middle" dominant-baseline="middle" font-size="14px" fill={tColor}>{txt}</text>
      <text x="50%" y="70%" text-anchor="middle" dominant-baseline="middle" font-size="14px" fill={tColor}>{txt2}</text>
    </g></svg>
  </button>
}