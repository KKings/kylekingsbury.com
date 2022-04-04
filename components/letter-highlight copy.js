import styles from './letter-highlight.module.css';

export default function LetterHighlight({ text }) {
    if (!text) {
        return null;
    }

    const firstLetter = text[0].toUpperCase();

    return (
        <span className={`${styles['post-letter']} uppercase invisible md:visible`}>{firstLetter}</span>
    );
};