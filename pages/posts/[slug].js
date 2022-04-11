import { useRouter } from 'next/router'
import ErrorPage from 'next/error'
import Container from '../../components/container'
import PostBody from '../../components/page-body'
import Header from '../../components/header'
import PostHeader from '../../components/post-header'
import Layout from '../../components/layout'
import { getPostBySlug, getAllPosts } from '../../lib/api'
import PostTitle from '../../components/post-title'
import Head from 'next/head'
import { CMS_NAME, HOST } from '../../lib/constants'
import markdownToHtml from '../../lib/markdownToHtml'
import readTime from '../../lib/read-time'
import PostTags from '../../components/post-tags';

export default function Post({ post, preview }) {
  const router = useRouter()
  if (!router.isFallback && !post?.slug) {
    return <ErrorPage statusCode={404} />
  }
  
  const canonicalUrl = (HOST + (router.asPath === "/" ? "": router.asPath)).split("?")[0];

  return (
    <Layout preview={preview}>
      <Container className='bg-king-red'>
        <Header />
      </Container>
      <Container className='container mx-auto md:px-5 md:-mt-reverse-cover'>
        {router.isFallback ? (
            <PostTitle>Loading...</PostTitle>
          ) : (
            <>
              <article className='p-6 pb-32 md:p-32 md:mb-16 lg:pt-48 bg-white drop-shadow-xl'>
                <Head>
                  <title>
                    {post.title} | {CMS_NAME}
                  </title>
                  <meta name="robots" content="follow, index"></meta>
                  { canonicalUrl &&
                    <link rel="canonical" href={canonicalUrl} />
                  }
                  { post.metaKeywords &&
                    <meta name="keywords" content={post.metaKeywords} />
                  }
                  { post.metaDescription &&
                    <meta name="description" content={post.metaDescription} />
                  }
                  { post && post.ogImage && <meta property='og:image' content={post.ogImage.url} /> }
                </Head>
                <PostHeader
                  title={post.title}
                  coverImage={post.coverImage}
                  date={post.date}
                  categories={post.categories}
                  time={readTime(post.content)}
                />
                <PostBody content={post.content} />
                <PostTags tags={post.tags} />
              </article>
            </>
          )}
      </Container>
    </Layout>
  )
}

export async function getStaticProps({ params }) {
  const post = getPostBySlug(params.slug, [
    'title',
    'date',
    'slug',
    'author',
    'categories',
    'tags',
    'content',
    'ogImage',
    'coverImage',
    'metaDescription',
    'metaKeywords'
  ]);

  const content = await markdownToHtml(post.content || '');

  return {
    props: {
      post: {
        ...post,
        content,
      },
    },
  }
}

export async function getStaticPaths() {
  const posts = getAllPosts(['slug'])

  return {
    paths: posts.map((post) => {
      return {
        params: {
          slug: post.slug,
        },
      }
    }),
    fallback: false,
  }
}
