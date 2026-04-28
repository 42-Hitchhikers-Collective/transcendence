import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/shared/components/ui/alert'
import { CircleCheckIcon } from 'lucide-react'

export function Pattern() {
  return (
    <Alert>
      <CircleCheckIcon />
      <AlertTitle>Alert!</AlertTitle>
      <AlertDescription>
        This is an alert with icon, title and description.
      </AlertDescription>
    </Alert>
  )
}
