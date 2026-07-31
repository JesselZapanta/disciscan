import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.jsx'
import {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogBackdrop,
  DialogPopup,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export default function SignOutButton({ className }) {
  const navigate = useNavigate()
  const { logout } = useAuth()

  function handleConfirm() {
    logout().then(() => navigate('/login', { replace: true }))
  }

  return (
    <Dialog>
      <DialogTrigger
        className={
          className ||
          'w-full flex items-center justify-center gap-2 text-xs font-mono border border-border rounded px-3 py-2 text-muted-foreground hover:text-status-flagged hover:border-status-flagged/40 transition'
        }
      >
        <LogOut className="h-3.5 w-3.5" />
        SIGN OUT
      </DialogTrigger>
      <DialogPortal>
        <DialogBackdrop />
        <DialogPopup>
          <DialogTitle>Sign out?</DialogTitle>
          <DialogDescription>
            Are you sure you want to sign out of DisciScan? You will need to log in again.
          </DialogDescription>
          <div className="mt-6 flex justify-end gap-2">
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <Button variant="destructive" onClick={handleConfirm}>
              Sign out
            </Button>
          </div>
        </DialogPopup>
      </DialogPortal>
    </Dialog>
  )
}
