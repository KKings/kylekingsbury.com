const contentSecurityPolicy = `
    default-src 'self';
    script-src 'self';
    child-src kylekingsbury.com;
    style-src 'self' kylekingsbury.com;
    font-src 'self'; 
    img-src 'self' media.giphy.com;
`;

const securityHeaders = [
    {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload'
    },
    {
        key: 'X-XSS-Protection',
        value: '1; mode=block'
    },
    {
        key: 'X-Frame-Options',
        value: 'SAMEORIGIN'
    },
    {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
    },
    {
        key: 'X-Content-Type-Options',
        value: 'nosniff'
    },
    {
        key: 'Referrer-Policy',
        value: 'origin-when-cross-origin'
    },
    {
        key: 'Content-Security-Policy',
        value: contentSecurityPolicy.replace(/\s{2,}/g, ' ').trim()
    }
];

const nextConfig = {
    async headers() {
        return [
            {
                source: '/:path*',
                headers: securityHeaders,
            },
        ]
    },
    async redirects() {
        return [
            {
                source: '/sitecore-cache-extensions',
                destination: '/posts/sitecore-cache-extensions',
                permanent: true
            },
            {
                source: '/deliver-faster-with-the-fluent-contentsearch-library',
                destination: '/posts/deliver-faster-with-the-fluent-contentsearch-library',
                permanent: true
            },
            {
                source: '/unit-testing-devices-and-layouts-with-sitecore-fakedb',
                destination: '/posts/unit-testing-devices-and-layouts-with-sitecore-fakedb',
                permanent: true
            },
            {
                source: '/results-from-upgrading-to-project-dilithium-and-unicorn-4',
                destination: '/posts/results-from-upgrading-to-project-dilithium-and-unicorn-4',
                permanent: true
            },
            {
                source: '/handling-unhandled-exceptions-within-sitecore-renderings',
                destination: '/posts/handling-unhandled-exceptions-within-sitecore-renderings',
                permanent: true
            },
            {
                source: '/sitecore-page-mode-switcher',
                destination: '/posts/sitecore-page-mode-switcher',
                permanent: true
            },
            {
                source: '/what-to-know-before-overriding-the-sitecore-item-resolver',
                destination: '/posts/what-to-know-before-overriding-the-sitecore-item-resolver',
                permanent: true
            },
            {
                source: '/configuring-sitecores-solrprovider-to-use-solrpostconnection',
                destination: '/posts/configuring-sitecores-solrprovider-to-use-solrpostconnection',
                permanent: true
            },
            {
                source: '/mapping-integers-values-to-boolean-values-within-solr-with-the-contentsearch-api',
                destination: '/posts/mapping-integers-values-to-boolean-values-within-solr-with-the-contentsearch-api',
                permanent: true
            },
            {
                source: '/targets-dropdown-not-populating-within-the-link-dialog',
                destination: '/posts/targets-dropdown-not-populating-within-the-link-dialog',
                permanent: true
            },
            {
                source: '/reaching-the-max-pages-viewed-threshold-for-an-xdb-session',
                destination: '/posts/reaching-the-max-pages-viewed-threshold-for-an-xdb-session',
                permanent: true
            },
            {
                source: '/failed-to-synchronize-segments-message-value-cannot-be-null',
                destination: '/posts/failed-to-synchronize-segments-message-value-cannot-be-null',
                permanent: true
            },
            {
                source: '/creating-a-custom-command-with-sitecore-powershell-extensions',
                destination: '/posts/creating-a-custom-command-with-sitecore-powershell-extensions',
                permanent: true
            },
            {
                source: '/sitecore-mvp-2019-technology',
                destination: '/posts/sitecore-mvp-2019-technology',
                permanent: true
            },
            {
                source: '/a-tale-of-improving-the-sitecore-8-2-experience-editor-performance',
                destination: '/posts/a-tale-of-improving-the-sitecore-8-2-experience-editor-performance',
                permanent: true
            },
            {
                source: '/a-faster-isderived-extension-method',
                destination: '/posts/a-faster-isderived-extension-method',
                permanent: true
            },
            {
                source: '/pattern-for-implementing-a-custom-htmlcacheclearer',
                destination: '/posts/pattern-for-implementing-a-custom-htmlcacheclearer',
                permanent: true
            },
            {
                source: '/sitecore-horizon-overview',
                destination: '/posts/sitecore-horizon-overview',
                permanent: true
            },
            {
                source: '/filtering-sitecore-tree-type-fields-by-the-inheritance-chain',
                destination: '/posts/filtering-sitecore-tree-type-fields-by-the-inheritance-chain',
                permanent: true
            },
            {
                source: '/updating-sitecore-xp-roles-to-rotate-logs-based-on-file-size',
                destination: '/posts/updating-sitecore-xp-roles-to-rotate-logs-based-on-file-size',
                permanent: true
            },
            {
                source: '/top-5-reasons-your-sitecore-search-is-slow-and-how-to-resolve',
                destination: '/posts/top-5-reasons-your-sitecore-search-is-slow-and-how-to-resolve',
                permanent: true
            }
        ]
    },
}

module.exports = nextConfig;