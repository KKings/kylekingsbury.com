import '../styles/index.css';
import 'prismjs/themes/prism.css';
import NProgress from 'nprogress';
import Router from 'next/router';

NProgress.configure({ showSpinner: false });

Router.events.on('routeChangeStart', (url) => {
  NProgress.start();
});

Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}
