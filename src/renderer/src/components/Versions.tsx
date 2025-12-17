import { useState } from 'react'

function Versions(): React.JSX.Element {
  const [versions] = useState(window.electron.process.versions)

  return (
    <div>
      <h1 className="text-2xl font-bold">Esquemas</h1>
      <div className="mt-4 border-l pl-4">
        <ul className="flex border justify-center p-2 rounded-full w-fit bg-card items-center flex-wrap gap-4 [&>li]:px-3 [&>li]:py-2 [&>li]:rounded-full [&>li]:bg-muted [&>li]:w-fit [&>li]:font-semibold [&>li]:border-2 [&>li]:border-primary/80 [&>li]:shadow-[0px_0px_20px_var(--primary)] [&>li]:shadow-primary [&>li]:hover:scale-105 [&>li]:transition-all [&>li]:cursor-pointer [&>li]:active:scale-95">
          <li className="electron-version">Electron v{versions.electron}</li>
          <li className="chrome-version">Chromium v{versions.chrome}</li>
          <li className="node-version">Node v{versions.node}</li>
        </ul>
      </div>
    </div>
  )
}

export default Versions
