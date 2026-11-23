import './globals.css';
import 'katex/dist/katex.min.css';
import { cookies } from 'next/headers';
export const metadata={title:'ACT Mastery',description:'Private ACT preparation platform'};
export default async function RootLayout({children}:{children:React.ReactNode}){
  const theme=(await cookies()).get('act-theme')?.value;
  return <html lang="en" data-theme={theme==='dark'||theme==='light'?theme:undefined}><body>{children}</body></html>;
}
