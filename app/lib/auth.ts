import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import {prisma} from "@/app/lib/prisma";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "sqlite", // or "mysql", "sqlite", ...etc
    }),
    emailAndPassword: {
        enabled: true,
    }
});