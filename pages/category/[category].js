import { useRouter } from 'next/router'
import ErrorPage from 'next/error'
import Head from 'next/head'
import Container from '../../components/container'
import Header from '../../components/header'
import Layout from '../../components/layout'
import PostListing from '../../components/post-listing';
import { CMS_NAME, HOST } from '../../lib/constants';
import { getAllPostsByCategory, getAllPosts } from '../../lib/api'

export default function Category({ posts, preview, category }) {
  const router = useRouter();
  if (!router.isFallback && !posts || posts.length == 0) {
    return <ErrorPage statusCode={404} />
  }
  
  const canonicalUrl = (HOST + (router.asPath === "/" ? "": router.asPath)).split("?")[0];
  
  return (
    <Layout preview={preview}>
      <Head>
        <title>
          {category} | {CMS_NAME}
        </title>
        <meta name="robots" content="follow, index"></meta>
        { canonicalUrl &&
          <link rel="canonical" href={canonicalUrl} />
        }
      </Head>
      <Container className="bg-king-red">
        <Header />
      </Container>
      <Container className="container mx-auto md:px-5 -mt-reverse-cover">
        <article className="mb-4 p-10 md:mb-16 bg-white md:p-article drop-shadow-xl">
          <PostListing 
            posts={posts}
            title={`Category - ${category}`} 
            isListing={true}
          />
        </article>
      </Container>
    </Layout>
  )
}

export async function getStaticProps({ params }) {
  const posts = getAllPostsByCategory(params.category.toLowerCase(), [
    'title',
    'date',
    'slug',
    'author',
    'categories',
    'tags',
    'content',
    'ogImage',
    'coverImage',
  ]);

  return {
    props: {
      posts,
      category: params.category,
    },
  };
}

export async function getStaticPaths() {
  const posts = getAllPosts(['categories']);

  const categories = posts.flatMap((post) => post.categories)
    .filter(category => category !== undefined)
    .map(category => category.toLowerCase());

  const paths = [...new Set(categories)].map(category => {
    return {
      params: {
        category,
      },
    };
  });

  return {
    paths,
    fallback: false,
  };
}
