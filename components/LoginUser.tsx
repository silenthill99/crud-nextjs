"use client"

import React from 'react';
import {authClient} from "@/app/lib/auth-client";
import Link from "next/link";

const LoginUser = () => {
    const {data: session} = authClient.useSession()
    return (
        <>
            {session ? (
                <p>Tableau de bord</p>
            ) : (
                <ul className={"flex gap-2"}>
                    <li><Link href={"/register"}>Créer un compte</Link></li>
                    <li><Link href={"/sign-in"}>Se connecter</Link></li>
                </ul>
            )}
        </>
    );
};

export default LoginUser;