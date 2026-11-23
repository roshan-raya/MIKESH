import katex from 'katex';

export function RichText({value}: {value:string}) {
  return <span className="preserve">{value.split(/(\$[^$\n]+\$)/).map((part,index)=>
    part.startsWith('$') && part.endsWith('$') && part.length>2
      ? <span key={index} dangerouslySetInnerHTML={{__html:katex.renderToString(part.slice(1,-1),{throwOnError:false,trust:false})}}/>
      : part)}</span>;
}
