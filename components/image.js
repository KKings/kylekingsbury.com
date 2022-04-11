import Image from 'next/image';
import { HOST } from '../lib/constants';

const cloudflareImageLoader = ({ src, width, quality }) => {
    if (!quality) {
        quality = 75;
    }
    return `https://imgix.kylekingsbury.workers.dev?width=${width}&quality=${quality}&image=${HOST}${src}`
}

export default function Img(props) {
    if (process.env.NODE_ENV === 'development') {
        return <Image unoptimized={true} {...props} />
    } else {
        return <Image {...props} loader={cloudflareImageLoader} />
    }
}