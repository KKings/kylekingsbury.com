import styles from '../components/separator.module.css'
import DateFormatter from '../components/date-formatter';
import LetterHighlight from '../components/letter-highlight';
import PostCategories from '../components/post-categories';
import Link from 'next/link'

export default function PostPreview({
  title,
  date,
  excerpt,
  slug,
  categories,
  time
}) {
  return (
    <div className={`relative mt-10 mb-8 md:mt-32 md:mb-40 ${styles['separator']}`}>
      <header>
        <h2 className="text-3xl mb-3 leading-snug">
          <Link href={`/posts/${slug}`}>
            <a className='text-4xl md:text-5xl lg:text-6xl font-bold leading-snug mb-4 md:text-left text-slate-800 border-0 hover:border-0 break-words'>{title}</a>
          </Link>
        </h2>
        <LetterHighlight text={title} />
        <div className="text-lg mb-4">
          <div className="mb-6 text-sm text-slate-500">
            {categories && (
              <>
                <PostCategories categories={categories} />
                <span className='m-2'>/</span>
              </>
            )}
            <span>
              <DateFormatter dateString={date} />
            </span>
            { time && 
              <>
                <span className='m-2'>/</span>
                <span>
                  {time} Min read
                </span>
              </>
            }
          </div>
        </div>
      </header>
      <p className="text-lg leading-relaxed mb-10 pb-14  break-all">{excerpt}</p>

    </div>
  )
}
