'use client'

type Props = {
  text: string
  style?: React.CSSProperties
}

export default function AnimatedTitle({ text, style }: Props) {
  return (
    <h1
      className="page-title"
      style={style}
    >
      {text}
    </h1>
  )
}
