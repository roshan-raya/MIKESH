import Nav from '@/components/nav';
import {requireStudent} from '@/lib/student';
import {sourceLibrary} from '@/lib/courses/sources';

export default async function Sources(){
  await requireStudent();
  return <><Nav/><main id="main" className="shell"><h1>Source library</h1>
    <p>The lessons and questions use original wording. External materials are linked for specifications and reference.</p>
    {Object.entries(sourceLibrary).map(([id,source])=><article className="panel stack" key={id}>
      <h2><a href={source.url}>{source.title}</a></h2>
      <p>{source.organization} · {source.skill}</p>
      <p className="muted">Checked <time dateTime={source.checked}>{source.checked}</time> · {source.rights}</p>
    </article>)}
  </main></>;
}
