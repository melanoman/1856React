import React from 'react';
import die from './icon/die.svg';
import die4 from './icon/die4.svg';
import die8 from './icon/die8.svg';
import die12 from './icon/die12.svg';
import die20 from './icon/die20.svg';
import die100 from './icon/die100.svg';
import gear1 from './icon/gear1.svg';
import gear2 from './icon/gear2.svg';
import gear3 from './icon/gear3.svg';
import gear4 from './icon/gear4.svg';
import gear5 from './icon/gear5.svg';
import gear6 from './icon/gear6.svg';

function rollTest(props, die) {
  props.axios.get('http://10.0.0.143:32109/roll/'+die
  ).then((response) => props.fiddle(response.data)).catch((error) => {
    if(error.response) {
      props.fiddle(error.response.status + ":" + error.response.data);
    } else {
      props.fiddle("No Response...");
    }
  });
}

function gearTest(props, gear) {
  props.axios.get('http://10.0.0.143:32109/gear/'+gear
  ).then((response) => props.fiddle(response.data)).catch((error) => {
    if(error.response) {
      props.fiddle(error.response.status + ":" + error.response.data);
    } else {
      props.fiddle("No Response...");
    }
  });
}

export default function DicePanel(props) {
   return (<div>
     <div>
       <button onClick={() => rollTest(props, 'd4')} className="naked-button"><img src={die4} className="picture-button" alt="DiceTool" /></button>
       <button onClick={() => rollTest(props, 'd6')} className="naked-button"><img src={die} className="picture-button" alt="DiceTool" /></button>
       <button onClick={() => rollTest(props, 'd8')} className="naked-button"><img src={die8} className="picture-button" alt="DiceTool" /></button>
       <button onClick={() => rollTest(props, 'd12')} className="naked-button"><img src={die12} className="picture-button" alt="DiceTool" /></button>
       <button onClick={() => rollTest(props, 'd20')} className="naked-button"><img src={die20} className="picture-button-20" alt="DiceTool" /></button>
       <button onClick={() => rollTest(props, 'd100')} className="naked-button"><img src={die100} className="picture-button-20" alt="DiceTool" /></button>
     </div>
     <div>
       <button onClick={() => gearTest(props, 1)} className="naked-button"><img src={gear1} className="picture-button-20" alt="DiceTool" /></button>
       <button onClick={() => gearTest(props, 2)} className="naked-button"><img src={gear2} className="picture-button-20" alt="DiceTool" /></button>
       <button onClick={() => gearTest(props, 3)} className="naked-button"><img src={gear3} className="picture-button-20" alt="DiceTool" /></button>
       <button onClick={() => gearTest(props, 4)} className="naked-button"><img src={gear4} className="picture-button-20" alt="DiceTool" /></button>
       <button onClick={() => gearTest(props, 5)} className="naked-button"><img src={gear5} className="picture-button-20" alt="DiceTool" /></button>
       <button onClick={() => gearTest(props, 6)} className="naked-button"><img src={gear6} className="picture-button-20" alt="DiceTool" /></button>
     </div>
     <div>
       <input type="text" onChange={(e)=>props.setCustom(e.target.value)}/>
       <button onClick={() => rollTest(props, props.custom)}>Custom</button>
     </div>
     <button onClick={() => props.fiddle(null)}>Clear</button>
     <div style={{whiteSpace: 'pre-wrap'}}>{props.display}</div>
   </div>);
}