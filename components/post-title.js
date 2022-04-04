export default function PostTitle({ children }) {
  return (
    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-snug mb-4 md:text-left break-words">
      {children}
    </h1>
  )
}
