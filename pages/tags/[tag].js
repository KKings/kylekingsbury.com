import { useRouter } from 'next/router';
import ErrorPage from 'next/error'
import Head from 'next/head'
import Container from '../../components/container'
import Header from '../../components/header'
import Layout from '../../components/layout'
import PostListing from '../../components/post-listing';
import { HOST, CMS_NAME } from '../../lib/constants';
import { getAllPostsByTag, getAllPosts } from '../../lib/api';

export default function Tag({ posts, preview, tag }) {
  const router = useRouter();
  if (!router.isFallback && !posts || posts.length == 0) {
    return <ErrorPage statusCode={404} />
  }
  
  const canonicalUrl = (HOST + (router.asPath === "/" ? "": router.asPath)).split("?")[0];
  
  return (
    <Layout preview={preview}>     
      <Head>
        <title>
          {tag} | {CMS_NAME}
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
        <article className="p-6 pb-32 md:p-32 md:mb-16 lg:pt-48 bg-white drop-shadow-xl">
          <PostListing 
            posts={posts}
            title={`Tag - ${tag}`} 
            isListing={true}
          />
        </article>
      </Container>
    </Layout>
  )
}

export async function getStaticProps({ params }) {
  const posts = getAllPostsByTag(params.tag.toLowerCase(), [
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
      tag: params.tag,
    },
  };
}

export async function getStaticPaths() {
  const posts = getAllPosts(['tags']);

  const tags = posts.flatMap((post) => post.tags)
    .filter(tag => tag !== undefined)
    .map(tag => tag.toLowerCase());

  const paths = [...new Set(tags)].map(tag => {
    return {
      params: {
        tag,
      },
    };
  });

  return {
    paths,
    fallback: false,
  };
}
