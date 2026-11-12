import type { Metadata } from "next";
import "./globals.css";
export const metadata:Metadata={title:"ちきゅうくんの エコチャレンジ",description:"地球くんからのSOS。みんなで地球を助けよう。"};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="ja"><body>{children}</body></html>}
