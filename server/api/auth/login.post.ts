import { loginRequestSchema } from "~/core";
import { getRuntimeConfig } from "~/server/utils/runtime-config";



export default defineEventHandler(async (event) => {
  const config = getRuntimeConfig(event);
  const body = await readBody(event);
  const result = loginRequestSchema.safeParse(body);

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.error.issues.at(0)?.message ?? "Invalid request payload",
      cause: result.error,
    });
  }

  const { password } = result.data;

  if (password === config.password) {
    const isDev = import.meta.dev;

    setCookie(event, "auth-token", "authenticated", {
      httpOnly: true,
      secure: !isDev,
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "strict",
    });

    return { success: true };
  }

  throw createError({
    statusCode: 401,
    statusMessage: "Invalid password",
  });
});
