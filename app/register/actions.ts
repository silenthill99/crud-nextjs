"use server";

import {redirect} from "next/navigation";
import * as z from "zod";
import {prisma} from "@/app/lib/prisma";
import {auth} from "@/app/lib/auth";
import {
    RegisterActionState,
    RegisterFormValues,
    RegisterSchema,
} from "./schema";

export async function register(
    _previousState: RegisterActionState,
    formData: FormData,
): Promise<RegisterActionState> {
    const rawValues = Object.fromEntries(formData) as Partial<RegisterFormValues>;

    const result = RegisterSchema.safeParse(rawValues);
    if (!result.success) {
        return {
            errors: z.flattenError(result.error).fieldErrors,
        };
    }

    if (await prisma.user.findUnique({where: {email: result.data.email}})) {
        return {
            errors: {email: ["Adresse mail déjà utilisée"]},
        };
    }

    try {
        await auth.api.signUpEmail({body: result.data});
    } catch (error: unknown) {
        return {
            errors: {
                email: [error instanceof Error ? error.message : "Inscription impossible"],
            },
        };
    }

    redirect("/");
}
