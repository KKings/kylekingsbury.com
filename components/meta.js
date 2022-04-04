import Head from 'next/head'
import { CMS_NAME } from '../lib/constants'

export default function Meta() {
  return (
    <Head>
      <link rel="shortcut icon" href="/favicons/favicon.ico" />
      <meta
        name="description"
        content={`${CMS_NAME} - A Sitecore web development blog.`}
      />
    </Head>
  )
}
