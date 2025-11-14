import CredentialsProvider from "next-auth/providers/credentials";
import { jwtVerify } from "jose";
import NextAuth, { NextAuthOptions, User, Session, DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

interface AppRole {
    app: string;
    roles: string[];
}

// ฟังก์ชันสำหรับ refresh token
const refreshAccessToken = async (token: JWT) => {

    try {
        // เรียก API เพื่อ refresh token
        const response = await fetch(`${process.env.LOGIN_API_URL}/api/auth/refresh`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token.refreshToken}`,
            },
        });

        if (!response.ok) {
            throw new Error("Failed to refresh token");
        }

        const refreshedTokens = await response.json();
        return {
            ...token,
            accessToken: refreshedTokens.accessToken,
            refreshToken: refreshedTokens.refreshToken || token.refreshToken,
            error: undefined
        };
    } catch (error) {
        console.error("Error refreshing access token", error);
        return {
            ...token,
            accessToken: "", // Clear the access token
            refreshToken: "", // Clear the refresh token
            error: "RefreshAccessTokenError"
        };
    }
};

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text", placeholder: "username" },
                password: { label: "Password", type: "password", placeholder: "password" },
            },
            async authorize(credentials) {
                if (!credentials) {
                    throw new Error("Credentials are missing");
                }

                const { username, password } = credentials;
                try {
                    const response = await fetch(`${process.env.LOGIN_API_URL}/api/auth/login`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ username, password }),
                    });

                    if (!response.ok) {
                        throw new Error("Failed to authenticate");
                    }

                    const data = await response.json();

                    if (!data.accessToken || !data.refreshToken) {
                        return null;
                    }

                    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
                    const { payload } = await jwtVerify(data.accessToken, secret);
                    const userPayload = payload as { userID: string; username: string; name: string; email: string; appRoles: AppRole[] };

                    const contractRoles = userPayload.appRoles
                        .filter((role: AppRole) => role.app === 'Contract')
                        .flatMap((role: AppRole) => role.roles); // Flatten the array of roles

                    if (contractRoles.length > 0) {



                        const user = {
                            id: userPayload.userID,
                            name: userPayload.name,
                            email: userPayload.email,
                            username: username,
                            accessToken: data.accessToken,
                            refreshToken: data.refreshToken,
                            roles: userPayload.appRoles
                                .filter((role: AppRole) => role.app === "Contract")
                                .flatMap((role: AppRole) => role.roles),
                        };

                        return user;

                    } else {
                        return null;
                    }

                } catch (error) {
                    console.error(error);
                    return null;
                }
            }
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 86400, // อายุ session เป็น 1 วัน (24 ชั่วโมง)
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/login",
        signOut: '/',
    },
    // เพิ่ม cookies configuration เพื่อแยก cookie name
    cookies: {
        sessionToken: {
            name: `next-auth.session-token.contract`, // เปลี่ยนชื่อ cookie ให้เฉพาะโปรเจคนี้
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: false
            }
        },
        callbackUrl: {
            name: `next-auth.callback-url.contract`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: false
            }
        },
        csrfToken: {
            name: `next-auth.csrf-token.contract`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: false
            }
        }
    },
    callbacks: {
        async jwt({ token, user }: { token: JWT; user?: User }) {
            if (user?.accessToken) {
                token.accessToken = user.accessToken;
                token.refreshToken = user.refreshToken;
            }


            try {
                // ทดสอบว่า token ยังใช้งานได้หรือไม่
                const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);

                await jwtVerify(token.accessToken as string, secret);

                // token ยังใช้งานได้ ไม่ต้องทำ refresh
                return token;
            } catch (error: unknown) {
                // token หมดอายุหรือไม่ถูกต้อง ให้ทำการ refresh
                if (error instanceof Error) {
                    console.error('1. Invalid access token:', error.message);
                } else {
                    console.error('2. Invalid access token:', error);
                }
                const refreshedToken = await refreshAccessToken(token);

                // Check if refresh was successful
                if (refreshedToken.error === "RefreshAccessTokenError" || !refreshedToken.accessToken) {
                    // Force sign out by returning an empty token
                    return {};
                }
                return refreshedToken;
            }



        },

        async session({
            session,
            token,
        }: {
            session: Session;
            token: JWT;
        }): Promise<Session | DefaultSession> {
            // If we don't have an access token, the user should be signed out
            if (!token?.accessToken) {
                return session;
            }

            try {
                const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
                const { payload } = await jwtVerify(token.accessToken, secret);

                const userPayload = payload as {
                    userID: string;
                    username: string;
                    name: string;
                    email: string;
                    appRoles: AppRole[];
                };

                // Filter the roles to only include those for the app named "Contract"
                const contractRoles = userPayload.appRoles
                    .filter((role: AppRole) => role.app === 'Contract')
                    .flatMap((role: AppRole) => role.roles);

                if (contractRoles.length > 0) {
                    // Create properly typed session
                    const typedSession: Session = {
                        ...session,
                        user: {
                            ...session.user,
                            userID: userPayload.userID,
                            username: userPayload.username,
                            name: userPayload.name,
                            email: userPayload.email,
                            roles: contractRoles,
                        },
                        accessToken: token.accessToken,
                        expires: session.expires
                    };

                    return typedSession;
                } else {
                    return session;
                }
            } catch (error) {
                console.error('3. Invalid access token:', error);
                return session;
            }
        }
    }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
