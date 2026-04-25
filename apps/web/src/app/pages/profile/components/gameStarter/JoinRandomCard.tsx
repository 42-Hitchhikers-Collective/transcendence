import { useState } from 'react'

export function JoinRandomGame() {
  const [isWaitingPopupOpen, setIsWaitingPopupOpen] = useState(false)

  return (
    <>
      <div className='space-y-4'>
        <p className='text-muted-foreground text-sm'>Click the button to play with random players</p>

        <div className='flex justify-center'>
          <button
            type='button'
            onClick={() => setIsWaitingPopupOpen(true)}
            className='bg-primary text-primary-foreground rounded-md px-5 py-2 text-sm font-medium hover:opacity-90'
          >
            Join
          </button>
        </div>
      </div>

      {isWaitingPopupOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'>
          <div className='bg-card text-card-foreground w-full max-w-md rounded-xl border p-6 shadow-lg'>
            <p className='text-sm leading-relaxed'>
              Waiting to join game page. Do not refresh the page to avoid losing connection.
            </p>
            <div className='mt-4 flex justify-end'>
              <button
                type='button'
                onClick={() => setIsWaitingPopupOpen(false)}
                className='bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium hover:opacity-90'
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
