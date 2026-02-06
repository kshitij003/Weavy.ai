import { defineConfig } from "@trigger.dev/sdk/v3";

export default defineConfig({
    project: "proj_ostfzkpnltmlfqdwidad",
    runtime: "node",
    logLevel: "log",
    // Set the maxDuration to 300 seconds (5 minutes)
    maxDuration: 300,
    retries: {
        enabledInDev: true,
        default: {
            maxAttempts: 3,
            minTimeoutInMs: 1000,
            maxTimeoutInMs: 10000,
            factor: 2,
            randomize: true,
        },
    },
    dirs: ["./trigger"],
    build: {
        extensions: [
            {
                name: "install-ffmpeg",
                onBuild: async (context: any) => {
                    await context.addAptGetPackages(["ffmpeg"]);
                },
            } as any,
        ],
    },
});
