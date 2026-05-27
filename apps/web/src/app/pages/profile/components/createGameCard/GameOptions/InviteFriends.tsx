import { useEffect, useRef, useState } from 'react'
import { mockProfiles } from '@/app/auth/mockProfiles'
import { useNavigate } from 'react-router'

/* 
Preview of the InviteFriends component, which is a part of the InviteFriendsCard component.
It allows users to invite online players by inputting their username.
The component handles:
- Username Input: handles duplicates, self-invitation, user limit (max 3 invites), and empty input
- Requests mockProfiles data to check if the invited player exists and is online (backend integration will require changes in this logic, e.g., instead of checking against mockProfiles, the component will have to make an API call to the backend to validate the username and get the online status)
- Displays notifications based on the validation results, such as if the player does not exist, is offline, or has already been invited.
- Manages the list of invited users, allowing the user to remove/change invites before creating the room.
- The invite button has a timer to wait for users to accept the invite
- Automatically redirects to game after the tier ends (unless no one accepts the invite, in that case we can either show a "failed to create room" notification or we can instead have bots filling missing spots)
*/


export function InviteFriends() {
  const navigate = useNavigate()
  const [inviteName, setInviteName] = useState('')
  const [invitedUsers, setInvitedUsers] = useState<string[]>([])
  const [notification, setNotification] = useState<string | null>(null)
  const [isWaitingForAccepts, setIsWaitingForAccepts] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [acceptedUsersCount, setAcceptedUsersCount] = useState(0)

  const inviteTimerSeconds = 10
  const minAcceptedInvites = 1 // host + at least one invitee => minimum 2 players
  const countdownIntervalRef = useRef<number | null>(null)

  const currentUser = mockProfiles[0]

  const maxInvites = 3
  const canAddMoreUsers = invitedUsers.length < maxInvites
  const normalizedInviteName = inviteName.trim().toLowerCase()
  const isDuplicateInvite = invitedUsers.some(
    (user) => user.trim().toLowerCase() === normalizedInviteName,
  )

  const handleAddInvite = () => {
    const nextName = inviteName.trim()
    const matchedPlayer = mockProfiles.find(
      (profile) =>
        profile.username.toLowerCase() === normalizedInviteName &&
        profile.username !== currentUser.username,
    )

    if (!nextName || !canAddMoreUsers) return

    if (isDuplicateInvite) {
      setNotification('This player is already invited.')
      return
    }

    if (!matchedPlayer) {
      setNotification('Player does not exist.')
      return
    }

    if (!matchedPlayer.isOnline) {
      setNotification('Player is offline.')
      return
    }

    setInvitedUsers((prev) => [...prev, matchedPlayer.username])
    setInviteName('')
    setNotification(null)
  }

  const handleRemoveInvite = (indexToRemove: number) => {
    setInvitedUsers((prev) => prev.filter((_, index) => index !== indexToRemove))
  }

  const handleCreateRoom = () => {
    if (invitedUsers.length === 0) {
      setNotification('Invite at least one online player to create a room.')
      return
    }

    setNotification(null)
    setIsWaitingForAccepts(true)
    setAcceptedUsersCount(0)
    setSecondsLeft(inviteTimerSeconds)
  }

  useEffect(() => {
    if (!isWaitingForAccepts) return

    countdownIntervalRef.current = window.setInterval(() => {
      setSecondsLeft((previous) => {
        if (previous <= 1) {
          return 0
        }

        return previous - 1
      })
    }, 1000)

    return () => {
      if (countdownIntervalRef.current !== null) {
        window.clearInterval(countdownIntervalRef.current)
      }
    }
  }, [isWaitingForAccepts])

  useEffect(() => {
    if (!isWaitingForAccepts || secondsLeft > 0) return

    if (countdownIntervalRef.current !== null) {
      window.clearInterval(countdownIntervalRef.current)
    }

    const acceptedCount = invitedUsers.filter((_, index) => index % 2 === 0).length
    setAcceptedUsersCount(acceptedCount)
    setIsWaitingForAccepts(false)

    if (acceptedCount >= minAcceptedInvites) {
      navigate('/game')
      return
    }

    setNotification('Failed to create room: nobody accepted the invite in time.')
  }, [invitedUsers, isWaitingForAccepts, minAcceptedInvites, navigate, secondsLeft])

  return (
    <div className='space-y-4'>
      <p className='text-muted-foreground text-sm'>Create a room to play with your friends</p>

      <div className='flex gap-2'>
        <input
          type='text'
          value={inviteName}
          onChange={(event) => {
            setInviteName(event.target.value)
            setNotification(null)
          }}
          placeholder='Type an online username'
          disabled={!canAddMoreUsers || isWaitingForAccepts}
          className='bg-background w-full rounded-md border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60'
        />
        <button
          type='button'
          onClick={handleAddInvite}
          disabled={!canAddMoreUsers || !inviteName.trim() || isWaitingForAccepts}
          className='bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60'
        >
          Add
        </button>
      </div>
      {notification && (
        <p className='text-destructive text-xs'>
          {notification}
        </p>
      )}

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
                  disabled={isWaitingForAccepts}
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

      {isWaitingForAccepts ? (
        <div className='bg-muted rounded-md px-4 py-3 text-sm'>
          Waiting for players to accept... {secondsLeft}s
        </div>
      ) : (
        <button
          type='button'
          onClick={handleCreateRoom}
          disabled={invitedUsers.length === 0}
          className='bg-primary text-primary-foreground w-full rounded-md px-4 py-2 text-sm font-medium hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50'
        >
          Create room
        </button>
      )}

      {acceptedUsersCount > 0 && !isWaitingForAccepts && (
        <p className='text-muted-foreground text-xs'>
          {acceptedUsersCount} invited player(s) accepted in the last invite window.
        </p>
      )}
    </div>
  )
}
