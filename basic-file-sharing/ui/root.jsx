import { createRoot } from 'react-dom/client'
import Runtime from 'pear-electron'

import useWorker from '../lib/use-worker'

function App () {
  const { drives, addFile } = useWorker()

  const handleDrop = (e) => {
    e.preventDefault()
    onAddFiles(e.dataTransfer.files)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleSelect = (e) => {
    for (const file of e.target.files) {
      const filePath = Runtime.media.getPathForFile(file)
      addFile({ name: file.name, uri: filePath })
    }
  }

  const onAddFiles = (files) => {
    for (const file of files) {
      const filePath = Runtime.media.getPathForFile(file)
      addFile({ name: file.name, uri: filePath })
    }
  }

  return (
    <div className='bg-blue-500 min-h-screen p-4'>
      <div className='bg-white p-4'>
        <h2 className='text-lg font-bold mb-2'>Drives</h2>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className='border-2 border-dashed border-blue-500 p-2 mb-6 bg-white text-center'
        >
          <p>To add files to my drive, drag and drop files here, or click to select</p>
          <input
            type='file'
            multiple
            className='hidden'
            id='fileInput'
            onChange={handleSelect}
          />
          <label htmlFor='fileInput' className='cursor-pointer text-blue-500 underline'>Browse files</label>
        </div>
        <ul>
          {drives.map((drive, idx) => (
            <li key={idx} className='border-b py-1'>
              <div><a className='underline text-blue-700' href={drive.info.uri}>{drive.info.name} {drive.info.isMyDrive && '(My drive)'}</a></div>
              <div>
                {drive.info.files.map((file, idx) => (
                  <div key={idx}>
                    - <a className='underline text-blue-700' href={file.uri}>{file.name}</a>
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)
