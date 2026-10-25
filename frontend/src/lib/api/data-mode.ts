export function isMockMode() {
    return (process.env.NEXT_PUBLIC_DATA_MODE ?? "mock") === "mock";
}
