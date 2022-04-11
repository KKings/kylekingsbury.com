import { useRouter } from 'next/router';
import Container from '../components/container';
import HeroPost from '../components/hero-post';
import PostListing from '../components/post-listing';
import Layout from '../components/layout';
import Header from '../components/header';
import { getAllPosts } from '../lib/api';
import generateSitemap from '../lib/generate-sitemap';
import Head from 'next/head';
import { HOST, CMS_NAME } from '../lib/constants';
import readTime from '../lib/read-time';

export default function Index({ allPosts }) {
  
  const heroPost = allPosts[0];
  const morePosts = allPosts.slice(1);
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
        <Container className="mx-auto bg-king-red pb-64">
          <Header onIndex={true}>
            {heroPost && (
              <HeroPost
                title={heroPost.title}
                coverImage={heroPost.coverImage}
                date={heroPost.date}
                author={heroPost.author}
                slug={heroPost.slug}
                excerpt={heroPost.excerpt}
                time={readTime(heroPost.content)}
                categories={heroPost.categories}
              />
            )}
          </Header>
        </Container>
        <Container className="container mx-auto md:px-5 -mt-reverse-cover">
          <article className="mb-4 p-10 md:mb-16 bg-white md:p-article drop-shadow-xl">
            <PostListing 
              posts={morePosts}
              title="Latest Posts"
            />
          </article>
        </Container>
      </Layout>
    </>
  )
}

export async function getStaticProps() {
  const allPosts = getAllPosts([
    'title',
    'date',
    'slug',
    'author',
    'coverImage',
    'excerpt',
    'content',
    'categories',
    'tags'
  ])

  generateSitemap(allPosts);

  return {
    props: { allPosts },
  }
}
