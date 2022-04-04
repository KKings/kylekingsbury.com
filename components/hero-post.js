import DateFormatter from '../components/date-formatter'
import Link from 'next/link'
import PostCategories from '../components/post-categories'

export default function HeroPost({
  title,
  date,
  excerpt,
  categories,
  slug,
  time,
}) {
  return (
    <section className='block w-3/4 mx-auto'>
      <div className="text-white text-center">
        <div className='mb-4'>
          <h3 className="mb-5 text-4xl lg:text-7xl leading-tight">
            <Link href={`/posts/${slug}`}>
              <a className='hover:text-shadow'>{title}</a>
            </Link>
          </h3>
          <div className="max-w-3xl mx-auto">
            <div className="mb-6 text-sm">
              { categories && (
                <>
                  <PostCategories categories={categories} /> 
                  <span className='m-2'>/</span>
                </>
              )}
              <span>
                <DateFormatter dateString={date} />
              </span>
              <span className='m-2'>/</span>
              <span>
                {time} Min read
              </span>
            </div>
          </div>
        </div>
        {excerpt && (
          <div>
            <p className="text-lg leading-relaxed mb-4">{excerpt}</p>  
          </div>
        )}
        <Link href={`/posts/${slug}`}>
          <a className='inline-block mw-2em bg-slate-100 text-white font-bold py-3 px-16 uppercase text-king-red hover:drop-shadow-xl'>Read</a>
        </Link>
      </div>
    </section>
  )
}
