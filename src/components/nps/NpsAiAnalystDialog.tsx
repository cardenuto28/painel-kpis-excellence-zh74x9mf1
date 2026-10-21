import { useState, useRef, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { streamAgentChat, type DisplayMessage, displayableMessages } from '@/lib/skipAi'
import pb from '@/lib/pocketbase/client'
import { getAgentConversations, getAgentMessages } from '@/services/nps'
import { toast } from 'sonner'
import { Bot, Send, Sparkles, User, History, Plus, RefreshCw, ExternalLink } from 'lucide-react'

interface NpsAiAnalystDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface ChatItem {
  id: string
  role: 'user' | 'assistant'
  content: string
  created?: string
}

const QUICK_PROMPTS = [
  'Quais são os principais motivos de insatisfação em Pós-Vendas da BMW?',
  'Resuma os casos mais críticos pendentes de atendimento.',
  'Qual o segmento com pior índice de NPS e o que sugerir?',
  'Existe padrão de reclamação sobre demora de peças ou prazos?',
]

export function NpsAiAnalystDialog({ open, onOpenChange }: NpsAiAnalystDialogProps) {
  const [messages, setMessages] = useState<ChatItem[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Olá! Sou o Analista Especialista de NPS da PG Prime (BMW e BMW Motorrad Jundiaí). ' +
        'Estou conectado às bases de casos críticos, planos de ação e estatísticas semanais. ' +
        'Como posso ajudar você a aprimorar a experiência dos nossos clientes hoje?',
    },
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<any[]>([])
  const [showHistory, setShowHistory] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isStreaming])

  // Carregar histórico de threads anteriores ao abrir
  useEffect(() => {
    if (open) {
      getAgentConversations()
        .then((items) => setConversations(items))
        .catch(() => {})
    }
  }, [open])

  const handleSelectConversation = async (conv: any) => {
    try {
      const msgs = await getAgentMessages(conv.id)
      const cleanMsgs = displayableMessages(msgs)
      if (cleanMsgs.length > 0) {
        setMessages(cleanMsgs)
      }
      setConversationId(conv.id)
      setShowHistory(false)
      toast.success('Conversa carregada')
    } catch (_) {
      toast.error('Erro ao carregar mensagens da conversa')
    }
  }

  const handleNewConversation = () => {
    abortControllerRef.current?.abort()
    setConversationId(null)
    setMessages([
      {
        id: 'welcome-' + Date.now(),
        role: 'assistant',
        content:
          'Nova análise iniciada. Pode perguntar sobre casos específicos, tendências de notas ou sugestões de ação para a equipe da PG Prime.',
      },
    ])
    setShowHistory(false)
  }

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim()
    if (!text || isStreaming) return

    setInputMessage('')

    const userMsgId = 'user-' + Date.now()
    const assistantMsgId = 'assistant-' + Date.now()

    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: 'user', content: text },
      { id: assistantMsgId, role: 'assistant', content: '' },
    ])

    setIsStreaming(true)
    const abortController = new AbortController()
    abortControllerRef.current = abortController

    try {
      const token = pb.authStore.token
      const res = await fetch(
        `${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/nps/agent-chat-stream`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify({
            message: text,
            conversation_id: conversationId,
            title: text.slice(0, 40),
          }),
          signal: abortController.signal,
        },
      )

      await streamAgentChat(res, {
        onChunk: (_delta, full) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantMsgId ? { ...m, content: full } : m)),
          )
        },
        signal: abortController.signal,
      })

      // Atualizar conversationId se retornou no header
      const newConvId = res.headers.get('X-Conversation-Id')
      if (newConvId && !conversationId) {
        setConversationId(newConvId)
      }
    } catch (err: any) {
      if (abortController.signal.aborted) return
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                content:
                  m.content ||
                  'Desculpe, ocorreu uma instabilidade temporária ao consultar a base do NPS. Por favor, tente novamente.',
              }
            : m,
        ),
      )
    } finally {
      setIsStreaming(false)
      abortControllerRef.current = null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header do Chat */}
        <DialogHeader className="p-4 border-b border-border bg-card/60 backdrop-blur-sm flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold flex items-center gap-2">
                Analista NPS • IA Nativa
                <Badge
                  variant="outline"
                  className="text-[10px] bg-primary/10 text-primary border-primary/30"
                >
                  PG Prime Jundiaí
                </Badge>
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
                Análise em tempo real sobre casos críticos BMW e Motorrad
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 pr-6">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={handleNewConversation}
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nova Conversa</span>
            </Button>
            {conversations.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setShowHistory(!showHistory)}
              >
                <History className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Histórico</span>
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Corpo principal (mensagens ou histórico) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10 relative">
          {showHistory && (
            <div className="absolute inset-0 bg-background/95 backdrop-blur-sm z-10 p-6 overflow-y-auto animate-fade-in space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="font-semibold text-sm">Conversas Recentes</h4>
                <Button variant="ghost" size="sm" onClick={() => setShowHistory(false)}>
                  Fechar
                </Button>
              </div>
              <div className="space-y-1.5">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    className="w-full text-left p-3 rounded-lg border border-border bg-card hover:border-primary/50 text-xs transition-colors flex items-center justify-between"
                  >
                    <span className="font-medium truncate">{conv.title || 'Análise de NPS'}</span>
                    <span className="text-muted-foreground shrink-0 ml-2">
                      {conv.created ? new Date(conv.created).toLocaleDateString('pt-BR') : ''}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => {
            const isUser = m.role === 'user'
            return (
              <div
                key={m.id}
                className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted border border-border text-foreground'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-primary" />}
                </div>

                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? 'bg-primary text-primary-foreground rounded-tr-none'
                      : 'bg-card border border-border rounded-tl-none text-foreground shadow-sm'
                  }`}
                >
                  {m.content || (
                    <span className="flex items-center gap-1.5 text-muted-foreground italic text-xs">
                      <Sparkles className="w-3.5 h-3.5 animate-spin text-primary" />
                      Analisando os dados da PG Prime...
                    </span>
                  )}
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Sugestões rápidas de prompt */}
        {messages.length <= 2 && (
          <div className="px-4 py-2 border-t border-border bg-muted/20 flex gap-1.5 overflow-x-auto scrollbar-hide">
            {QUICK_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(prompt)}
                className="text-[11px] px-2.5 py-1 rounded-full border border-border/80 bg-background hover:border-primary/60 text-muted-foreground hover:text-foreground whitespace-nowrap transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input box */}
        <div className="p-3 border-t border-border bg-card">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSendMessage()
            }}
            className="flex items-center gap-2"
          >
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Pergunte ao analista sobre casos, notas ou recomendações..."
              className="text-xs sm:text-sm"
              disabled={isStreaming}
            />
            <Button
              type="submit"
              size="sm"
              disabled={isStreaming || !inputMessage.trim()}
              className="gap-1.5 shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Enviar</span>
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
