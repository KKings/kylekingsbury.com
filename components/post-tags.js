import Link from 'next/link'

export default function PostTags({ tags }) {

    if (!tags || tags.length === 0) {
        return null;
    }

    return (      
        <div className="max-w-3xl mx-auto">
            { 
                tags.map((tag, index) => (
                    <Link href={`/tags/${tag.toLowerCase()}`} key={`${tag}-${index}`}>
                        <a className='border-none inline-block mw-2em bg-slate-100 text-white text-sm mr-2 py-2 px-8 capitalize transition text-king-red hover:drop-shadow-xl hover:border-none'>
                            {tag}
                        </a>
                    </Link>
                ))
            }
        </div>
    );
};