import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { ChatInterface } from '@/components/chat/chat-interface'

export default async function ChatPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="h-screen flex flex-col">
      <ChatInterface />
    </div>
  )
}