import { createRoot } from 'react-dom/client'

import useWorker from './use-worker'

function App () {
  const { invite, files, error, clearError } = useWorker()

  return (
    <div className='bg-blue-500 min-h-screen p-4'>
      <div className='mb-2'>{`Invite: ${invite}`}</div>
      <div className='bg-white p-4'>
        <h2 className='text-lg font-bold mb-2'>Drives</h2>
        <ul>
          {files.map((item) => (
            <li key={item.key} className='border-b py-1'>
              <div>Drive: <a className='underline text-blue-700' href={item.dir}>{item.key}</a></div>
              <div>
                {item.files.map((file, idx) => (
                  <div key={idx}>
                    - <a className='underline text-blue-700' href={file.url}>{file.name}</a>
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
      {error && (
        <div className='bg-red-500 text-white p-2 flex items-center justify-between'>
          <pre>{error}</pre>
          <button className='cursor-pointer' onClick={() => clearError()}>X</button>
        </div>
      )}
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)
