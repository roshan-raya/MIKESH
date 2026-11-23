import Link from 'next/link';
import Nav from '@/components/nav';
import {requireStudent} from '@/lib/student';
import {sourceLibrary} from '@/lib/courses/sources';

export default async function Advanced(){
  await requireStudent();
  return <><Nav/><main id="main" className="shell"><p className="eyebrow">Target composite 34–36</p><h1>Advanced preparation</h1>
    <section className="panel stack"><h2>Build accuracy on unfamiliar problems</h2>
      <p>On a hard question, write the target quantity or claim before you look at the options. Eliminate answers that violate a restriction, contradict the passage, or answer a different question. In Functions, use advanced practice to combine domain restrictions and inverse operations.</p>
      <Link href="/learn/functions?view=practice">Functions practice</Link>
    </section>
    <section className="panel stack"><h2>Build section endurance</h2>
      <p>Start a timed set and mark questions that take too long. Afterward, separate errors caused by unfamiliar material from pacing, misreading, or arithmetic. Use the mistake notebook before the next timed set.</p>
      <div className="toolbar"><Link href="/practice?mode=timed">Timed section practice</Link><Link href="/mistakes">Mistake notebook</Link></div>
    </section>
    <section className="panel stack"><h2>Benchmark with an official form</h2>
      <p>Take the official sections in order with the published time limits. Score with that form’s own conversion table. Log the scaled scores alongside the form ID so later comparisons use the correct scale.</p>
      <div className="toolbar"><a href={sourceLibrary['act-free'].url}>Official free ACT forms</a><Link href="/analytics">Log and compare scores</Link></div>
    </section>
  </main></>;
}
