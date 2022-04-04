import styles from '../components/separator.module.css';
import PostPreview from './post-preview';
import readTime from '../lib/read-time';

const truncate = (text, maxLength = -1) => {

  const words = text
    .trim()
    .replace(/[ ]{2,}/gi, " ")
    .replace(/\n /, "\n")
    .split(" ");

  return maxLength !== -1 && words.length > maxLength
    ? `${words.slice(0, maxLength).join(" ")}...`
    : text;
}

export default function PostListing({ posts, title, isListing = false }) {
  const headerStyles = `md:-mt-20 mb-8 text-1xl md:text-1xl font-bold text-center uppercase relative pb-10 ${styles['separator']}`;

  return (
    <section className='max-w-3xl mx-auto'>
      { title && 
        isListing ? (     
        <h1 className={headerStyles}>
          {title}
        </h1>
        ) : (   
        <h2 className={headerStyles}>
          {title}
        </h2>
        )
      }
      <div className="mb-32">
        {posts.map((post) => (
          <PostPreview
            key={post.slug}
            title={post.title}
            coverImage={post.coverImage}
            date={post.date}
            author={post.author}
            slug={post.slug}
            categories={post.categories}
            time={readTime(post.content)}
            excerpt={post.excerpt ?? truncate(post.content, 50)}
          />
        ))}
      </div>
    </section>
  )
}
