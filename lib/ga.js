export const track = (url) => {
    if (!window 
        || !window.gtag
        || !process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS) {
        return;
    }

    window.gtag('config', process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS, {
        page_path: url,
    })
};