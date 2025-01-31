import z from "zod";

const userSchema = z.object({
  username: z
    .string({
      invalid_type_error: "nombre de usuario debe ser un string",
      required_error: "nombre de usuario requerido",
    })
    .min(5),
  password: z
    .string({
      required_error: "la contraseña es requerida",
    })
    .min(6),
});

export function validateUsername(input) {
  return userSchema.safeParse(input);
}
