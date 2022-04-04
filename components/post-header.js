import DateFormatter from '../components/date-formatter'
import CoverImage from '../components/cover-image'
import PostTitle from '../components/post-title'
import PostCategories from '../components/post-categories'
import LetterHighlight from '../components/letter-highlight';

export default function PostHeader({ title, coverImage, date, categories, time }) {

  return (
    <>
    <div className="max-w-3xl mx-auto relative">
      <PostTitle>{title}</PostTitle>
      <LetterHighlight text={title} />
    </div>
      { coverImage && 
        <div className="mb-8 md:mb-16 sm:mx-0">
          <CoverImage title={title} src={coverImage} height={620} width={1240} />
        </div>
      }
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 text-sm text-slate-500">
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
    </>
  )
}
