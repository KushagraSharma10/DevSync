import { useParams } from 'react-router-dom'

const Room = () => {
  const { code } = useParams<{ code: string }>()

  return (
    <div className="min-h-screen p-6 text-slate-900">
      <h1 className="text-2xl font-semibold">Room</h1>
      <p className="mt-2 text-slate-600">
        Room page — coming soon
        {code ? ` (code: ${code})` : null}
      </p>
    </div>
  )
}

export default Room
