import React from 'react';
import {Metadata} from "next";
import Form from "next/form";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {authClient} from "@/app/lib/auth-client";
import {redirect} from "next/navigation";
import * as z from "zod";
import {prisma} from "@/app/lib/prisma";

export const metadata: Metadata = {
    title: "Créer un compte"
}

const RegisterSchema = z.object({
    name: z.string().trim().min(2, "2 caractères minimum"),
    email: z.email("Adresse mail invalide"),
    password: z.string().min(8, "8 caractères minimum"),
    password_confirmation: z.string(),
})
    .refine(d => d.password === d.password_confirmation, {error: "Les mots de passe doivent être identiques", path: ['password_confirmation']})
    .transform(({password_confirmation, ...d}) => d);

function back(errors: object): never {
    redirect(`/register?e=${encodeURIComponent(JSON.stringify(errors))}`)
}

async function register(formData: FormData) {
    "use server"
    let data
    try {
        data = RegisterSchema.parse(Object.fromEntries(formData))
    } catch (e) {
        back(z.flattenError(e as z.ZodError).fieldErrors)
    }


    if (await prisma.user.findUnique({where: {email: data.email}})) back({email: ["Adresse mail déjà utilisée"]})

    await authClient.signUp.email(data, {
        onSuccess: async () => {
            redirect('/')
        },
        onError: async ({error}) => {
            back({email: [error.message ?? "Inscription impossible"]})
        }
    })
}

const Err = ({m}: { m?: string[] }) => <p className={'text-sm text-destructive'}>{m?.[0]}</p>

const Page = async ({searchParams}: { searchParams: Promise<{ e?: string }> }) => {
    const errors = JSON.parse((await searchParams).e ?? "{}")
    return (
        <div className={'container mx-auto py-5'}>
            <Form action={register} className={'space-y-5'}>
                <div>
                    <Label htmlFor={"email"}>Adresse mail</Label>
                    <Input
                        type={"email"}
                        name={"email"}
                        id={"email"}
                    />
                    <Err m={errors.email}/>
                </div>
                <div>
                    <Label htmlFor={"name"}>Votre nom</Label>
                    <Input
                        name={"name"}
                        id={"name"}
                    />
                    <Err m={errors.name}/>
                </div>
                <div>
                    <Label htmlFor={"password"}>Votre mot de passe</Label>
                    <Input
                        type={"password"}
                        name={"password"}
                        id={"password"}
                    />
                    <Err m={errors.password}/>
                </div>
                <div>
                    <Label htmlFor={"password_confirmation"}>Confirmez votre mot de passe</Label>
                    <Input
                        type={"password"}
                        name={"password_confirmation"}
                        id={"password_confirmation"}
                    />
                    <Err m={errors.password_confirmation}/>
                </div>
                <Button type={"submit"}>Créer un compte</Button>
            </Form>
        </div>
    );
};

export default Page;