# Validation du formulaire d'inscription

Cette documentation explique le fonctionnement du formulaire situé dans `app/register`.

Le formulaire utilise deux validations complémentaires :

- une validation côté client, pour éviter un aller-retour serveur quand les données sont manifestement invalides ;
- une validation côté serveur, qui reste obligatoire et fait foi.

## Les fichiers

```text
app/register/
├── page.tsx            # Page Next.js
├── register-form.tsx   # Formulaire et validation client au submit
├── actions.ts          # Traitement serveur
└── schema.ts           # Règles Zod partagées
```

## 1. `schema.ts` : les règles communes

Le schéma décrit ce qu'est une inscription valide :

```ts
export const RegisterSchema = z.object({
    name: z.string().trim().min(2, "2 caractères minimum"),
    email: z.email("Adresse mail invalide"),
    password: z.string().min(8, "8 caractères minimum"),
    password_confirmation: z.string(),
})
```

Cela signifie :

- `name` doit être une chaîne de caractères ;
- les espaces au début et à la fin du nom sont supprimés ;
- le nom doit contenir au moins 2 caractères ;
- `email` doit respecter le format d'une adresse e-mail ;
- `password` doit contenir au moins 8 caractères ;
- `password_confirmation` sert à comparer les deux mots de passe.

La comparaison est faite avec `refine` :

```ts
.refine(d => d.password === d.password_confirmation, {
    error: "Les mots de passe doivent être identiques",
    path: ["password"],
})
```

Après la validation, la confirmation est supprimée avant l'appel à Better Auth. Better Auth reçoit uniquement `name`, `email` et `password`.

## 2. `register-form.tsx` : le formulaire côté client

Le fichier contient :

```ts
"use client";
```

Il s'agit donc d'un composant client. Il peut utiliser `useState`, `useActionState` et les événements du formulaire.

### Les champs sont non contrôlés

Les champs n'utilisent volontairement pas `value` ni `onChange` :

```tsx
<Input name="email" type="email" />
```

Le navigateur conserve lui-même les valeurs. C'est le comportement normal d'un formulaire HTML et c'est suffisant avec `next/form`.

`next/form` se charge d'envoyer le formulaire à la Server Action. Il n'a pas besoin que React conserve une copie de chaque champ.

Un champ contrôlé, avec `value` et `onChange`, serait utile uniquement pour une interface qui doit réagir à chaque frappe : formatage, aperçu en direct, affichage conditionnel, etc. Ce n'est pas nécessaire pour valider le formulaire au moment de son envoi.

### Validation avant l'envoi

Quand l'utilisateur soumet le formulaire, `handleSubmit` lit les valeurs natives du formulaire :

```ts
const formData = new FormData(event.currentTarget);
const result = RegisterSchema.safeParse(Object.fromEntries(formData));
```

Le même schéma Zod que celui du serveur est donc utilisé côté client.

Si les données sont invalides :

```ts
event.preventDefault();
```

empêche l'envoi au serveur et les erreurs sont affichées immédiatement.

Si les données sont valides, aucun `preventDefault` n'est appelé. `next/form` envoie alors normalement la `FormData` à l'action serveur.

Il n'y a volontairement pas de validation à chaque frappe ni au `blur`. Ce serait uniquement un choix d'interface, pas une amélioration de la validation elle-même.

## 3. `useActionState` : le lien avec le serveur

Cette ligne connecte le formulaire à l'action serveur :

```ts
const [state, formAction, isPending] = useActionState(
    register,
    initialRegisterState,
);
```

Les trois valeurs signifient :

- `state` : le dernier résultat renvoyé par le serveur ;
- `formAction` : la fonction passée au formulaire ;
- `isPending` : indique si l'envoi est en cours.

Le formulaire utilise ensuite :

```tsx
<Form action={formAction}>
```

Pendant l'envoi, le bouton est désactivé et son texte devient `Création…`.

## 4. `actions.ts` : le serveur reste l'autorité

Le fichier commence par :

```ts
"use server";
```

La fonction `register` s'exécute donc sur le serveur.

Elle reçoit un objet `FormData`, puis le transforme en objet JavaScript :

```ts
const rawValues = Object.fromEntries(formData);
```

Même si le navigateur a déjà validé les données, le serveur recommence la validation :

```ts
const result = RegisterSchema.safeParse(rawValues);
```

Cette deuxième validation est indispensable. Le client peut être contourné ; le serveur ne doit jamais lui faire confiance.

Si les données sont invalides, l'action retourne les erreurs :

```ts
return {
    errors: z.flattenError(result.error).fieldErrors,
};
```

Si l'inscription réussit, l'utilisateur est redirigé vers `/`.

## 5. Déroulement complet

```text
L'utilisateur remplit les champs
              ↓
Soumission du formulaire
              ↓
Lecture des champs avec FormData
              ↓
Validation client avec Zod
              ↓
Si invalide : affichage des erreurs et arrêt
              ↓
Si valide : envoi à la Server Action
              ↓
Nouvelle validation Zod côté serveur
              ↓
Vérification de l'adresse e-mail dans Prisma
              ↓
Création du compte par Better Auth
              ↓
Redirection vers `/`
```

La validation client évite uniquement un envoi inutile. La validation serveur est celle qui protège réellement l'application.

## 6. Pourquoi utiliser le même schéma des deux côtés ?

Le schéma est défini une seule fois dans `schema.ts` et importé par le client et le serveur.

Cela évite que le client et le serveur appliquent deux règles différentes. Le client donne un retour rapide, tandis que le serveur vérifie toujours à nouveau les données reçues.

## 7. Les erreurs affichées

Les erreurs côté client sont stockées dans `clientErrors`.

Les erreurs côté serveur sont stockées dans `state.errors`, fourni par `useActionState`.

Pour chaque champ, le formulaire affiche d'abord l'erreur client si elle existe, puis l'erreur serveur :

```ts
clientErrors[field] ?? state.errors[field]
```

Les erreurs sont aussi signalées au navigateur avec `aria-invalid`, et leur contenu utilise `aria-live="polite"` pour les technologies d'assistance.

## 8. Les règles actuellement appliquées

| Champ | Règle |
|---|---|
| Nom | Au moins 2 caractères après suppression des espaces extérieurs |
| E-mail | Format d'adresse e-mail valide |
| Mot de passe | Au moins 8 caractères |
| Confirmation | Doit être identique au mot de passe |

La validation ne vérifie pas la présence de chiffres, de majuscules ou de caractères spéciaux. Ce sont des règles supplémentaires possibles, mais elles ne sont pas nécessaires au fonctionnement de la validation client/serveur actuelle.

## 9. Vérification effectuée

Le lint du dossier `app/register` passe sans erreur.

Le build complet du projet n'a pas pu aller jusqu'au bout parce que Next.js tente de télécharger les polices Google utilisées par `app/layout.tsx`. Ce problème est indépendant du formulaire d'inscription.
