import {RichText} from './rich-text';

const samples=Array.from({length:7},(_,index)=>{
  const x=index-1;
  return {x,y:x**2-4*x+3};
});
export default function ParabolaStudy(){
  return <figure className="panel stack">
    <figcaption><strong>Read roots and the vertex from the same graph</strong></figcaption>
    <p><RichText value="Sample points from $y=x^2-4x+3$. The crossing points are $(1,0)$ and $(3,0)$, and the minimum is $(2,-1)$."/></p>
    <div className="parabola-plot" role="img" aria-label="Seven plotted points form a U shape, crossing the horizontal axis at 1 and 3 and reaching its vertex at 2, negative 1.">
      <div className="parabola-x-axis"/><div className="parabola-y-axis"/>
      {samples.map(({x,y})=><span key={x} className="parabola-point" style={{left:(x+1)/6*100+'%',top:(8-y)/10*100+'%'}}/>)}
    </div>
    <details><summary>Read the plotted values</summary><table><caption>Input and output pairs</caption>
      <thead><tr><th scope="col">Input x</th><th scope="col">Output y</th></tr></thead>
      <tbody>{samples.map(({x,y})=><tr key={x}><td>{x}</td><td>{y}</td></tr>)}</tbody>
    </table></details>
  </figure>;
}
