import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
    server: {
        NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    },
    client: {
        // NEXT_PUBLIC_CLIENT_VAR: z.string(),
    },
    // If you're using Next.js < 13.4.4, you'll need to specify the runtimeEnv manually
    runtimeEnv: {
        NODE_ENV: process.env.NODE_ENV,
        // NEXT_PUBLIC_CLIENT_VAR: process.env.NEXT_PUBLIC_CLIENT_VAR,
    },
    // For Next.js >= 13.4.4, you only need to destructure client variables:
    // experimental__runtimeEnv: {
    //   NEXT_PUBLIC_CLIENT_VAR: process.env.NEXT_PUBLIC_CLIENT_VAR,
    // }
});
