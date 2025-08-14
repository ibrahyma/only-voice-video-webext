export function getUrlDomain(url: string): string {
    return new URL(url).hostname
        .split(".")
        .splice(-2)
        .join(".");
}
