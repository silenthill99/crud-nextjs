import type { Metadata } from 'next';
import React from 'react';
import Form from "next/form";
import {authClient} from "@/app/lib/auth-client";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";

export const metadata: Metadata = {
    title: "Se connecter"
}

async function login(formData: FormData) {
    "use server"
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    await authClient.signIn.email({
        email,
        password
    })
}

const Home = () => {
    return (
        <div className={"container mx-auto py-5"}>
            <Form action={login} className={"space-y-5"}>
                <div>
                    <Label htmlFor={"email"}>Adresse mail</Label>
                    <Input
                        type={"email"}
                        name={"email"}
                        id={"email"}
                    />
                </div>
                <div>
                    <Label htmlFor={"password"}>Password</Label>
                    <Input
                        type={"password"}
                        name={"password"}
                        id={"password"}
                    />
                </div>
                <Button type={"submit"}>Se connecter</Button>
            </Form>
        </div>
    );
};

export default Home;