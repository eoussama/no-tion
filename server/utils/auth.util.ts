import { getCookie, createError, type H3Event } from 'h3';



export async function isLoggedIn(e: H3Event): Promise<boolean> {
	const token = getCookie(e, "session");
	if (!token) {
		throw createError({ statusCode: 401, statusMessage: "Unauthenticated" });
	}
	
	const user = await validateToken(token);
	if (!user){
		throw createError({ statusCode: 401, statusMessage: "Invalid session" });
	}

	return true;
}

export type AuthUser = { id: string; email?: string }
async function validateToken(token: string): Promise<AuthUser | null> {
  return { id: "u1", email: "user@example.com" }
}