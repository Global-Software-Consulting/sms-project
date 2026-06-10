'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Upload, MessageSquare, Loader2, Send, Clock, X } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getTickets,
  createTicket,
  getTicketDetail,
  sendTicketMessage,
  Ticket,
  TicketMessage,
  getTicketStatusLabel,
} from '@/lib/api/ticketsApi';

const MAX_OPEN_TICKETS = 3;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function Support() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tickets state
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Inline chat state — keyed by ticket ID
  const [openChatId, setOpenChatId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<TicketMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const [chatImage, setChatImage] = useState<File | null>(null);
  const [chatImagePreview, setChatImagePreview] = useState<string | null>(null);
  const chatFileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const openTicketCount = tickets.filter(
    (t) =>
      t.status === 'OPEN' ||
      t.status === 'PENDING' ||
      t.status === 'IN_PROGRESS' ||
      t.status === 'WAITING_CUSTOMER',
  ).length;

  // Fetch tickets
  const fetchTickets = useCallback(
    async (overridePage?: number) => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getTickets({
          page: overridePage ?? page,
          limit: 20,
        });
        setTickets(response.tickets);
        setTotalPages(response.totalPages);
      } catch {
        setError('Failed to load tickets');
      } finally {
        setIsLoading(false);
      }
    },
    [page],
  );

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Image handling for create ticket form
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError('Only JPG, PNG, and WEBP images are supported.');
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError('Image must be less than 5MB.');
      return;
    }

    setImage(file);
    setError(null);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Image handling for chat
  const handleChatImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return;
    if (file.size > MAX_IMAGE_SIZE) return;

    setChatImage(file);
    const reader = new FileReader();
    reader.onload = (ev) => setChatImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const removeChatImage = () => {
    setChatImage(null);
    setChatImagePreview(null);
    if (chatFileInputRef.current) chatFileInputRef.current.value = '';
  };

  // Create ticket handler
  const handleSubmitTicket = async () => {
    if (!title.trim() || !description.trim()) return;
    if (openTicketCount >= MAX_OPEN_TICKETS) {
      setError(`You can only have ${MAX_OPEN_TICKETS} open tickets at a time.`);
      return;
    }
    try {
      setIsSubmitting(true);
      setError(null);
      await createTicket(
        {
          subject: title.charAt(0).toUpperCase() + title.slice(1),
          priority: 'NORMAL',
          message: description,
        },
        image ? [image] : undefined,
      );
      setTitle('');
      setDescription('');
      removeImage();
      setPage(1);
      await fetchTickets(1);
    } catch {
      setError('Failed to create ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle inline chat
  const handleToggleChat = async (ticket: Ticket) => {
    if (openChatId === ticket.id) {
      // Hide chat
      setOpenChatId(null);
      setChatMessages([]);
      setChatMessage('');
      removeChatImage();
      return;
    }

    // Open chat for this ticket
    setOpenChatId(ticket.id);
    setChatLoading(true);
    setChatMessages([]);
    setChatMessage('');
    removeChatImage();
    try {
      const detail = await getTicketDetail(ticket.id);
      setChatMessages(detail.messages || []);
    } catch {
      setChatMessages([]);
    } finally {
      setChatLoading(false);
    }
  };

  // Send chat message
  const handleSendMessage = async () => {
    if ((!chatMessage.trim() && !chatImage) || !openChatId) return;
    try {
      setChatSending(true);
      const newMsg = await sendTicketMessage(
        openChatId,
        chatMessage,
        chatImage || undefined,
      );
      setChatMessages((prev) => {
        // The socket echo may already have appended this message. Dedup
        // by id so the user doesn't see their own reply twice.
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
      setChatMessage('');
      removeChatImage();
      // Response counter is now incremented by the socket listener for
      // every incoming message (including our own echo). Don't bump
      // here too — that would double-count.
    } catch {
      // silently fail
    } finally {
      setChatSending(false);
    }
  };

  // Auto-scroll chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // Live chat updates: backend pushes `ticket:message` over the socket
  // (forwarded by NotificationContext as a window event). Append any
  // message for the currently-open ticket; bump the response count for
  // every other ticket so the list stays in sync without a reload.
  useEffect(() => {
    const handler = (evt: Event) => {
      const detail = (evt as CustomEvent).detail as
        | { ticketId: string; message: any }
        | undefined;
      if (!detail?.ticketId || !detail?.message) return;

      if (detail.ticketId === openChatId) {
        setChatMessages((prev) => {
          if (prev.some((m) => m.id === detail.message.id)) return prev;
          return [...prev, detail.message];
        });
      }

      setTickets((prev) =>
        prev.map((t) =>
          t.id === detail.ticketId
            ? { ...t, responses: (t.responses || 0) + 1 }
            : t,
        ),
      );
    };
    window.addEventListener('ticket:message', handler);
    return () => window.removeEventListener('ticket:message', handler);
  }, [openChatId]);

  const formatDateTime = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return (
        date.toLocaleDateString('en-US', {
          month: 'numeric',
          day: 'numeric',
          year: 'numeric',
        }) +
        ', ' +
        date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Support</h1>
        <p className="text-muted-foreground mt-1">
          Get help from our support team
        </p>
      </div>

      {/* Create Support Ticket */}
      <Card>
        <CardHeader>
          <CardTitle>Create Support Ticket</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Textarea
            placeholder="Describe your issue"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
          />

          {/* Image attachment */}
          <div>
            <p className="text-muted-foreground mb-2 text-sm">
              Attach Image (optional)
            </p>
            {imagePreview ? (
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-20 w-20 rounded-md border object-cover"
                />
                <button
                  onClick={removeImage}
                  className="bg-destructive text-destructive-foreground absolute -top-2 -right-2 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Choose File
              </Button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.gif,.pdf"
              onChange={handleImageSelect}
              className="hidden"
            />
            <p className="text-muted-foreground mt-1 text-xs">
              Max file size: 5MB. Supported formats: JPG, PNG, WEBP
            </p>
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm">
              Open tickets: {openTicketCount} / {MAX_OPEN_TICKETS}
            </p>
            <Button
              onClick={handleSubmitTicket}
              disabled={
                isSubmitting ||
                !title.trim() ||
                !description.trim() ||
                openTicketCount >= MAX_OPEN_TICKETS
              }
              className="bg-primary"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* My Tickets */}
      <Card>
        <CardHeader>
          <CardTitle>My Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center text-sm">
              No tickets yet. Create one above if you need help.
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="border-border overflow-hidden rounded-lg border"
                >
                  {/* Ticket header row */}
                  <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-base font-semibold break-words">
                        {ticket.subject}
                      </h4>
                      <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm">
                        <Badge
                          variant={
                            ticket.status === 'OPEN' ? 'default' : 'outline'
                          }
                          className="text-xs"
                        >
                          <Clock className="mr-1 h-3 w-3" />
                          {getTicketStatusLabel(ticket.status)}
                        </Badge>
                        <span>{formatDateTime(ticket.createdAt)}</span>
                        <span className="flex items-center">
                          <MessageSquare className="mr-1 h-3 w-3" />
                          {ticket.responses}{' '}
                          {ticket.responses === 1 ? 'message' : 'messages'}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleToggleChat(ticket)}
                      className="w-full shrink-0 sm:w-auto"
                    >
                      {openChatId === ticket.id ? 'Hide Chat' : 'Open Chat'}
                    </Button>
                  </div>

                  {/* Inline chat area */}
                  {openChatId === ticket.id && (
                    <div className="border-border border-t">
                      {/* Messages area */}
                      <div className="bg-background/50 h-[320px] overflow-y-auto p-3 sm:h-[400px] sm:p-4">
                        {chatLoading ? (
                          <div className="flex h-full items-center justify-center">
                            <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
                          </div>
                        ) : chatMessages.length === 0 ? (
                          <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
                            No messages yet.
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {chatMessages.map((msg) => (
                              <div
                                key={msg.id}
                                className={`flex ${msg.isStaff ? 'justify-start' : 'justify-end'}`}
                              >
                                <div
                                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm sm:max-w-[80%] sm:px-4 ${
                                    msg.isStaff
                                      ? 'bg-muted text-foreground'
                                      : 'bg-primary text-primary-foreground'
                                  }`}
                                >
                                  <p className="mb-1 text-xs font-medium break-words opacity-70">
                                    {msg.isStaff
                                      ? msg.senderName || 'Support'
                                      : 'You'}{' '}
                                    &bull; {formatDateTime(msg.createdAt)}
                                  </p>
                                  <p className="break-words whitespace-pre-wrap">
                                    {msg.message}
                                  </p>
                                  {msg.imageUrl && (
                                    <img
                                      src={msg.imageUrl}
                                      alt="Attachment"
                                      className="mt-2 max-h-48 max-w-full rounded-md object-contain"
                                    />
                                  )}
                                  {msg.attachments &&
                                    msg.attachments.length > 0 && (
                                      <div className="mt-2 space-y-2">
                                        {msg.attachments.map(
                                          (attachment, idx) => (
                                            <img
                                              key={idx}
                                              src={attachment.url}
                                              alt={
                                                attachment.originalName ||
                                                'Attachment'
                                              }
                                              className="max-h-48 max-w-full cursor-pointer rounded-md object-contain"
                                              onClick={() =>
                                                window.open(
                                                  attachment.url,
                                                  '_blank',
                                                )
                                              }
                                            />
                                          ),
                                        )}
                                      </div>
                                    )}
                                </div>
                              </div>
                            ))}
                            <div ref={chatEndRef} />
                          </div>
                        )}
                      </div>

                      {/* Chat input area */}
                      {ticket.status !== 'CLOSED' &&
                        ticket.status !== 'RESOLVED' && (
                          <div className="border-border border-t p-3 sm:p-4">
                            {chatImagePreview && (
                              <div className="relative mb-2 inline-block">
                                <img
                                  src={chatImagePreview}
                                  alt="Preview"
                                  className="h-16 w-16 rounded-md border object-cover"
                                />
                                <button
                                  onClick={removeChatImage}
                                  className="bg-destructive text-destructive-foreground absolute -top-2 -right-2 rounded-full p-0.5"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  chatFileInputRef.current?.click()
                                }
                                disabled={chatSending}
                                className="shrink-0"
                              >
                                <Upload className="h-4 w-4" />
                              </Button>
                              <input
                                ref={chatFileInputRef}
                                type="file"
                                accept=".jpg,.jpeg,.png,.webp,.gif,.pdf"
                                onChange={handleChatImageSelect}
                                className="hidden"
                              />
                              <Input
                                placeholder="Type your message..."
                                value={chatMessage}
                                onChange={(e) => setChatMessage(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                  }
                                }}
                                disabled={chatSending}
                                className="min-w-0 flex-1"
                              />
                              <Button
                                onClick={handleSendMessage}
                                disabled={
                                  chatSending ||
                                  (!chatMessage.trim() && !chatImage)
                                }
                                size="icon"
                                className="shrink-0 sm:hidden"
                                aria-label="Send"
                              >
                                {chatSending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Send className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                onClick={handleSendMessage}
                                disabled={
                                  chatSending ||
                                  (!chatMessage.trim() && !chatImage)
                                }
                                className="hidden shrink-0 sm:inline-flex"
                              >
                                {chatSending ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <Send className="mr-2 h-4 w-4" />
                                )}
                                Send
                              </Button>
                            </div>
                            <p className="text-muted-foreground mt-1 text-xs">
                              Max 5MB. Supported: JPG, PNG, WEBP (1 image only)
                            </p>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {!isLoading && totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
