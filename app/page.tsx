import LoginUser from "@/components/LoginUser";
import Link from "next/link";

export default function Home() {

  return (
    <div>
      <nav className={"flex items-center justify-between container mx-auto"}>
          <ul>
              <li>
                  <Link href={"/"} className={'hover:underline'}>Page d&#39;accueil</Link>
              </li>
          </ul>
          <LoginUser/>
      </nav>
    </div>
  );
}
