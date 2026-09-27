import * as z from "zod";

export const RegisterSchema = z.object({
    name: z.string().trim().min(2, "2 caractères minimum"),
    email: z.email("Adresse mail invalide"),
    password: z.string().min(8, "8 caractères minimum"),
    password_confirmation: z.string(),
})
    .refine(d => d.password === d.password_confirmation, {
        error: "Les mots de passe doivent être identiques",
        path: ["password"],
    })
    .transform(data => ({
        name: data.name,
        email: data.email,
        password: data.password,
    }));

export type RegisterFormValues = z.input<typeof RegisterSchema>;
export type RegisterFormErrors = Partial<Record<keyof RegisterFormValues, string[]>>;

export type RegisterActionState = {
    errors: RegisterFormErrors;
};

export const initialRegisterState: RegisterActionState = {
    errors: {},
};
