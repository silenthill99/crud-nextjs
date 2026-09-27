"use client";

import {FormEvent, useActionState, useState} from "react";
import Form from "next/form";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {register} from "./actions";
import {
    initialRegisterState,
    RegisterFormErrors,
    RegisterSchema,
} from "./schema";

const Err = ({messages}: { messages?: string[] }) => (
    <p className="text-sm text-destructive" aria-live="polite">
        {messages?.[0]}
    </p>
);

export function RegisterForm() {
    const [state, formAction, isPending] = useActionState(register, initialRegisterState);
    const [clientErrors, setClientErrors] = useState<RegisterFormErrors>({});

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        const formData = new FormData(event.currentTarget);
        const result = RegisterSchema.safeParse(Object.fromEntries(formData));

        const errors = result.success ? {} : result.error.flatten().fieldErrors;
        setClientErrors(errors);

        if (!result.success) {
            event.preventDefault();
        }
    };

    const errors = (field: keyof RegisterFormErrors) =>
        clientErrors[field] ?? state.errors[field];

    return (
        <Form action={formAction} onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
                <Label htmlFor="email">Adresse mail</Label>
                <Input
                    type="email"
                    name="email"
                    id="email"
                    aria-invalid={Boolean(errors("email")?.length)}
                />
                <Err messages={errors("email")} />
            </div>
            <div>
                <Label htmlFor="name">Votre nom</Label>
                <Input
                    name="name"
                    id="name"
                    aria-invalid={Boolean(errors("name")?.length)}
                />
                <Err messages={errors("name")} />
            </div>
            <div>
                <Label htmlFor="password">Votre mot de passe</Label>
                <Input
                    type="password"
                    name="password"
                    id="password"
                    aria-invalid={Boolean(errors("password")?.length)}
                />
                <Err messages={errors("password")} />
            </div>
            <div>
                <Label htmlFor="password_confirmation">Confirmez votre mot de passe</Label>
                <Input
                    type="password"
                    name="password_confirmation"
                    id="password_confirmation"
                    aria-invalid={Boolean(errors("password_confirmation")?.length)}
                />
                <Err messages={errors("password_confirmation")} />
            </div>
            <Button type="submit" disabled={isPending}>
                {isPending ? "Création…" : "Créer un compte"}
            </Button>
        </Form>
    );
}
