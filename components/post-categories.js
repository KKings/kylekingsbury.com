import Link from 'next/link'

export default function PostCategories({ categories }) {

    if (!categories || categories.length === 0) {
        return null;
    }

    const total = categories.length;

    return (
        <>
            <span className='pr-1'>In</span>
            { 
                categories.map((category, index) => (
                    <span key={`${category}-${index}`}>
                        <Link href={`/category/${category.toLowerCase()}`}>
                            <a>{category}</a>
                        </Link>
                        {index + 1 !== total && <span className="pr-1">,</span>}
                    </span>
                ))
            }
        </>
    );
};