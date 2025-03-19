export type CookieOptions = {
    httpOnly: boolean;
    secure: boolean;
    path: string;
    sameSite: "lax" | "strict" | "none";
    maxAge: number;
    domain?: string;
  };
  
  export const cookieOptions: CookieOptions = {
    httpOnly: true,
    secure: process.env.NEXT_PUBLIC_NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 Days
  };
  
  // Only set the domain if in production
  if (process.env.NEXT_PUBLIC_NODE_ENV === "production") {
    cookieOptions.domain = ".taskmanager.shop";
  }
  