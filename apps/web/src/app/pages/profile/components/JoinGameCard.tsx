import { useState } from 'react'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'

const options = [
  {
    name: 'Join a random room',
    value: 'join-random-game',
    content: 'Join a room with random players'
  },
  {
    name: 'Create a room',
    value: 'create-game',
    content: 'Create a room to play with your friends' // invite existing friends or share the room code with others to join as guests
  }
]

export function JoinGameCard() {
  const [isWaitingPopupOpen, setIsWaitingPopupOpen] = useState(false)
  const [inviteName, setInviteName] = useState('')
  const [invitedUsers, setInvitedUsers] = useState<string[]>([])

  const maxInvites = 3
  const canAddMoreUsers = invitedUsers.length < maxInvites

  const handleAddInvite = () => {
    const nextName = inviteName.trim()

    if (!nextName || !canAddMoreUsers) return

    setInvitedUsers(prev => [...prev, nextName])
    setInviteName('')
  }

  const handleRemoveInvite = (indexToRemove: number) => {
    setInvitedUsers(prev => prev.filter((_, index) => index !== indexToRemove))
  }

  return (
    <>
      <Card>
      <CardContent>
        <Tabs defaultValue={options[0].value} className='w-full max-w-sm'>
          <TabsList className='bg-background w-full justify-start rounded-none border-b p-0'>
            {options.map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className='bg-background data-[state=active]:border-b-primary h-full rounded-none border-b-2 border-transparent data-[state=active]:shadow-none'
              >
                {tab.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value='join-random-game' className='space-y-4 p-4'>
            <p className='text-muted-foreground text-sm'>{options[0].content}</p>

            <div className='flex justify-center'>
              <button
                type='button'
                onClick={() => setIsWaitingPopupOpen(true)}
                className='bg-primary text-primary-foreground rounded-md px-5 py-2 text-sm font-medium hover:opacity-90'
              >
                Join
              </button>
            </div>
          </TabsContent>

          <TabsContent value='create-game' className='space-y-4 p-4'>
            <p className='text-muted-foreground text-sm'>{options[1].content}</p>

            <div className='flex gap-2'>
              <input
                type='text'
                value={inviteName}
                onChange={event => setInviteName(event.target.value)}
                placeholder='Type a username'
                disabled={!canAddMoreUsers}
                className='bg-background w-full rounded-md border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60'
              />
              <button
                type='button'
                onClick={handleAddInvite}
                disabled={!canAddMoreUsers || !inviteName.trim()}
                className='bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60'
              >
                Add
              </button>
            </div>

            <div className='space-y-2'>
              <p className='text-sm font-medium'>Invited users</p>

              {invitedUsers.length === 0 ? (
                <p className='text-muted-foreground text-sm'>No users invited yet.</p>
              ) : (
                <div className='space-y-2'>
                  {invitedUsers.map((user, index) => (
                    <div
                      key={`${user}-${index}`}
                      className='bg-muted flex items-center justify-between rounded-md px-3 py-2 text-sm'
                    >
                      <span>{user}</span>
                      <button
                        type='button'
                        onClick={() => handleRemoveInvite(index)}
                        className='text-destructive font-semibold'
                        aria-label={`Remove ${user}`}
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type='button'
              disabled={invitedUsers.length !== maxInvites}
              className='bg-primary text-primary-foreground w-full rounded-md px-4 py-2 text-sm font-medium hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50'
            >
              Create room
            </button>
          </TabsContent>
        </Tabs>
      </CardContent>
      </Card>

      {isWaitingPopupOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'>
          <div className='bg-card text-card-foreground w-full max-w-md rounded-xl border p-6 shadow-lg'>
            <p className='text-sm leading-relaxed'>
              waiting to join game page, do not refresh page toi avoi losing connection
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



/* 
When adding users they show as card 03, can remove users too before sne request
https://shadcnstudio.com/docs/components/card
https://www.shadcn-ui-blocks.com/blocks/react/application/user-profiles/team-grid
*/
