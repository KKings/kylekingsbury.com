import markdownStyles from './markdown-styles.module.css';

export default function Body({ content, className, children }) {

  return (
    <div className={`max-w-3xl mx-auto pb-4 ${className}`}>
      <div
        className={markdownStyles['markdown']}
        dangerouslySetInnerHTML={{ __html: content }}
      />
      { children }
    </div>
  )
};
