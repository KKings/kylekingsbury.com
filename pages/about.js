import Head from 'next/head';
import Image from '../components/image';
import { useRouter } from 'next/router';
import Container from '../components/container';
import Layout from '../components/layout'
import Header from '../components/header'
import PageBody from '../components/page-body';
import { getPageBySlug } from '../lib/page-api';
import { CMS_NAME, HOST } from '../lib/constants';
import markdownToHtml from '../lib/markdownToHtml'
import LetterHighlight from '../components/letter-highlight';

export default function About({ page }) {

  const router = useRouter();
  const canonicalUrl = (HOST + (router.asPath === "/" ? "": router.asPath)).split("?")[0];

  return (
    <>
      <Layout>
        <Head>
          <title>{CMS_NAME} - A Sitecore web development blog</title>
          <meta name="robots" content="follow, index"></meta>
          { canonicalUrl &&
            <link rel="canonical" href={canonicalUrl} />
          }
        </Head>        
        <Container className="bg-king-red">
          <Header />
        </Container>
        <Container className="container mx-auto md:px-5 -mt-reverse-cover">
          <article className="mb-4 p-10 md:mb-16 bg-white md:p-32 lg:p-article drop-shadow-xl">
            <div className='page-title relative'>
              <h1 className='text-6xl'>{page.title}</h1>
              <LetterHighlight text={page.title} />
            </div>
            <div className='clear-both'>
              <div className="float-left pr-4">
                <Image 
                    src='/assets/images/kyle-kingsbury.jpg' 
                    alt="Kyle Kingsbury" 
                    width={150} 
                    height={150} 
                    className="rounded-full"
                  />
                </div>
                <PageBody className='text-xl' content={page.content} />
            </div>
            <div className="text-center mt-4">
              <Image
                src='/assets/images/sitecore-mvp-320x313.jpg'
                alt="Sitecore MVP 2019"
                width={300}
                height={293}
              />
            </div>
          </article>
        </Container>
      </Layout>
    </>
  )
}

export async function getStaticProps() {
  const page = getPageBySlug('about', [
    'content',
    'title'
  ]);
  
  const content = await markdownToHtml(page.content || '');

  return {
    props: { 
      page: {
        ...page,
        content,
      },
    },
  }
}
