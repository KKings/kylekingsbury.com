import Link from 'next/link'
import { useState } from 'react'

const menu = (
  <>
    <Link href="/about">
      <a
        className="pr-1 md:px-2 text-white font-semibold uppercase"
        >About
      </a>
    </Link>
    {/* <Link href="/contact">
      <a
        className="md:px-2 text-white md:font-semibold transition duration-300 uppercase"
        >Contact
      </a>
    </Link> */}
    </>
)

export default function Header({ onIndex, children }) {
  const paddingStyle = onIndex ? 'pb-24' : 'md:pb-cover';
  
  const [toggle, setToggle] = useState(false);

  const handler = (event) => {
    event.preventDefault();

    setToggle(!toggle);
  }

  return (
    <div className='container mx-auto px-6 md:px-5'>
      <div className={`flex py-5 ${paddingStyle}`}>
        <div className="flex items-center">
          <h2 className="text-white text-2xl md:text-4xl font-bold tracking-tight md:tracking-tighter leading-tight">
            <Link href="/">
              <a className='uppercase'>
                Kyle Kingsbury
              </a>
            </Link>
            <span className='block border-l-none text-sm pl-0 md:inline-block md:ml-3 md:pl-3 font-normal md:text-base md:border-l md:border-l-gray-300 md:align-middle'>
              A Sitecore web development blog
            </span>
          </h2>
        </div>
        <div className="flex items-center space-x-2 ml-auto">
          { menu }
        </div>
        <div className="hidden flex items-center ml-auto">
          <button className="outline-none mobile-menu-button" onClick={handler}>
            <svg
              className="w-6 h-6 text-white"
              x-show="!showMenu"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>  
          </button>
          { toggle &&
            <div className='fixed top 0 h-screen bg-white block relative w-100'>
              <div>
                <div>
                  { menu }
                </div>
              </div>
            </div>
          }
        </div>
      </div>
      
      { children }
    </div>
  )
}
