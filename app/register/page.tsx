import type {Metadata} from "next";
import {RegisterForm} from "./register-form";

export const metadata: Metadata = {
    title: "Créer un compte",
};

const Page = () => (
    <div className="container mx-auto py-5">
        <RegisterForm />
    </div>
);

export default Page;
