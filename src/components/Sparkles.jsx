import './Sparkles.css'

const sparkles = [
  ['8%', '14%', '0s'],
  ['23%', '72%', '-2.4s'],
  ['40%', '28%', '-4.8s'],
  ['58%', '82%', '-1.2s'],
  ['73%', '18%', '-3.7s'],
  ['88%', '61%', '-5.5s'],
  ['95%', '34%', '-0.8s'],
]

export default function Sparkles() {
  return (
    <div className="sparkles" aria-hidden="true">
      {sparkles.map(([left, top, delay], index) => (
        <span key={`${left}-${top}`} style={{ '--left': left, '--top': top, '--delay': delay }}>
          {index % 3 === 0 ? '✦' : '·'}
        </span>
      ))}
    </div>
  )
}
