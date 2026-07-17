import { Outlet } from 'react-router-dom'
import Header from './shared/Header'

function App() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-[1800px] flex-1 px-[clamp(2rem,9vw,150px)] py-6">
        <Outlet />
      </main>
    </>
  )
}

export default App
