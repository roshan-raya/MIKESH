'use client';
import {CartesianGrid,Line,LineChart,ResponsiveContainer,Tooltip,XAxis,YAxis} from 'recharts';
export default function Trend({points}:{points:{day:string;percent:number}[]}){
  return <div aria-hidden="true" style={{height:240}}><ResponsiveContainer width="100%" height="100%">
    <LineChart data={points}><CartesianGrid stroke="var(--border)"/><XAxis dataKey="day" stroke="var(--muted)"/>
      <YAxis domain={[0,100]} stroke="var(--muted)" unit="%"/><Tooltip contentStyle={{background:'var(--surface)',borderColor:'var(--border)'}}/>
      <Line type="monotone" dataKey="percent" name="Practice accuracy (%)" stroke="var(--accent)" strokeWidth={3}/>
    </LineChart></ResponsiveContainer></div>;
}
