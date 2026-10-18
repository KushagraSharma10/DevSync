const Login = () => {
  return (
    <div className="min-h-screen auth-bg text-(--text) flex items-center justify-center">
      <div className=" w-full max-w-md">
        <div>
          <h1 className="brand text-6xl font-bold">DevSync</h1>
          <p className="text-xl mt-2 text-(--text-muted)">code together in real time rooms</p>
        </div>
        <div className=" bg-(--bg-elevated) p-8 rounded-md border border-(--border) mt-10"> 
          <h2 className="mb-4 text-2xl font-semibold">Welcome Back</h2>
          <form className="flex flex-col gap-6">
            <input className="bg-(--bg) px-4 py-3 w-full rounded-lg text-sm outline-none border border-(--border)" type="email" placeholder="Email" />
            <input className="bg-(--bg) px-4 py-3 w-full rounded-lg text-sm outline-none border border-(--border)" type="password" placeholder="Password" />
            <button className="w-full bg-(--accent-dim) py-2 rounded-md text-white font-medium" type="submit">Login</button>
          </form>
        </div>
      </div>
        
    </div>
  )
}

export default Login
