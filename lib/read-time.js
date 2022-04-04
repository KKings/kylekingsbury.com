export default function readTime(content) {
    if (!content) {
        return 0;
    }
    
    const WPS = 275 / 60
    const regex = /\w/;

    let images = 0;

    let words = content.split(' ').filter((word) => {
        if (word.includes('<img')) {
            images += 1
        }

        return regex.test(word)
    }).length;

    let imageAdjust = images * 4;
    let imageSecs = 0;
    let imageFactor = 12;

    while (images) {
        imageSecs += imageFactor;

        if (imageFactor > 3) {
            imageFactor -= 1;
        }

        images -= 1;
    }

    const minutes = Math.ceil(((words - imageAdjust) / WPS + imageSecs) / 60);

    return minutes;
}