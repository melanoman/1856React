import React, {useState} from 'react';

const settings = {}

const TEST_COLOR = {
  border: 'black',
  fill: 'blue',
  text: 'white',
}

const TEST_SIZE = {
  height: 3,
  font: 3,
  vOff: 25,
  indent: 20,
  tab: 10,
}

function vmin(x) {
  return x+"vmin";
}

export function ConfigCerts(props) {
  return <div>
    <table>
      <tr><th>TINY</th><th>MED</th></tr>
      <tr>
      </tr>
    </table>
  </div>
}

function textUp(config, tweak) {
  config.vOff -= 1;
  settings.setTweak(tweak + 1)
}

function textDown(config, tweak) {
  config.vOff += 1;
  settings.setTweak(tweak - 1)
}

function textLeft(config, tweak) {
  config.indent -= 1;
  settings.setTweak(tweak + 1)
}

function textRight(config, tweak) {
  config.indent += 1;
  settings.setTweak(tweak - 1)
}

function textFontUp(config, tweak) {
  config.font += 0.2;
  settings.setTweak(tweak + 1)
}

function textFontDown(config, tweak) {
  config.font -= 0.2;
  settings.setTweak(tweak - 1)
}

function textFontThick(config, tweak) {
  config.tab += 0.2;
  settings.setTweak(tweak + 1)
}

function textFontThin(config, tweak) {
  config.tab -= 0.2;
  settings.setTweak(tweak - 1)
}

function tall(config, tweak) {
  config.height += 1
  settings.setTweak(tweak + 1)
}

function short(config, tweak) {
  config.height -= 0.5;
  settings.setTweak(tweak - 1)
}

export function CertButtonTest() {
  const [tweak, setTweak] = useState(33)
  const [tinySize, setTinySize] = useState(TEST_SIZE)
  const [testColor, setTestColor] = useState(TEST_COLOR)
  settings.setTweak = setTweak
  return certSettings(tinySize, testColor, tweak)
}

function certSettings(size, color, tweak) {
  if(tweak == 0) return
  return <div><table>
    <tr><td><button onClick={() => textUp(size, tweak)}>[^]</button></td>
        <td>{certButton(size, color, 2, "XXX")}</td>
        <td>{certButton(size, color, 2, "5")}</td>
        <td><button onClick={() => textFontUp(size, tweak)}>[+]</button></td>
        <td><button onClick={() => tall(size, tweak)}>[tall]</button></td>
    </tr>
    <tr><td><button onClick={() => textDown(size, tweak)}>[v]</button></td>
        <td><button onClick={() => textLeft(size, tweak)}>[left]</button></td>
        <td><button onClick={() => textRight(size, tweak)}>[right]</button></td>
        <td><button onClick={() => textFontDown(size, tweak)}>[-]</button></td>
        <td><button onClick={() => short(size, tweak)}>[short]</button></td>
    </tr>
    <tr>
      <td />
      <td><button onClick={() => textFontThin(size, tweak)}>[tab-]</button></td>
      <td><button onClick={() => textFontThick(size, tweak)}>[tab+]</button></td>
      <td />
    </tr>
    <tr>
      <td colspan="7" height={vmin(size.height)} font-size={vmin(size.font)}>
        <div>height {size.height}</div>
        <div>vOff {size.vOff}</div>
        <div>fontSize {size.font}</div>
        <div>indent {size.indent}</div>
        <div>tab {size.tab}</div>
      </td>
    </tr>
  </table></div>
}

function certButton(size, color, borderThickness, text) {
  var x = size.indent - text.length * size.tab; //TODO calculate x based on text length
  return <svg height={vmin(size.height)} font-size={vmin(size.font)}
              xmlns="http://www.w3.org/2000/svg" viewBox="0 0 95 70"><g>
       <path d="M 10 10 l 75 0 0 50 -75 0 0 -50"
             fill={color.fill} stroke-tab={borderThickness} stroke={color.border} />
       <text x={x} y={size.vOff} fill={color.text}>{text}</text>
  </g></svg>
}