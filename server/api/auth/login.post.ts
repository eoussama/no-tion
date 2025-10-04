export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const body = await readBody(event);

  const { password } = body;

  if (!password) {
    throw createError({
      statusCode: 400,
      statusMessage: "Password is required",
    });
  }

  // Compare with the password from environment
  if (password === config.password) {
    // Set a session cookie
    setCookie(event, "auth-token", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "strict",
    });

    return { success: true };
  }
  else {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid password",
    });
  }
});
