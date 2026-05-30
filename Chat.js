// Chat Application - Interactive JavaScript
(function() {
    'use strict';

    // --- State Management ---
    const state = {
        apiMode: false,
        currentUserId: null,
        currentConversationId: null,
        lastMessageId: 0,
        socket: null,
        pollingInterval: null,
        isTabVisible: true,
        isLoading: false,
        contactsData: {} // Cache for contact info
    };

    // --- DOM Elements ---
    const DOM = {
        chatName: document.getElementById('chatName'),
        chatAvatar: document.getElementById('chatAvatar'),
        chatStatus: document.getElementById('chatStatus'),
        chatMessages: document.getElementById('chatMessages'),
        messageForm: document.getElementById('messageForm'),
        messageInput: document.getElementById('messageInput'),
        typingIndicator: document.getElementById('typingIndicator'),
        contactSearch: document.getElementById('contactSearch'),
        contactList: document.getElementById('contactsList') || document.querySelector('.contact-list') || document.querySelector('.contacts'),
        toast: document.getElementById('toast'),
        chatItemIdInput: document.getElementById('chatItemId'),
        chatReceiverIdInput: document.getElementById('chatReceiverId')
    };

    // --- Logger ---
    const Log = {
        info: (msg) => console.log(`%c[CHAT] %c${msg}`, 'color: #00cfe8; font-weight: bold;', 'color: inherit;'),
        socket: (msg) => console.log(`%c[SOCKET] %c${msg}`, 'color: #28c76f; font-weight: bold;', 'color: inherit;'),
        fetch: (msg) => console.log(`%c[FETCH] %c${msg}`, 'color: #ff9f43; font-weight: bold;', 'color: inherit;'),
        api: (msg) => console.log(`%c[API] %c${msg}`, 'color: #ea5455; font-weight: bold;', 'color: inherit;'),
        auth: (msg) => console.log(`%c[AUTH] %c${msg}`, 'color: #7367f0; font-weight: bold;', 'color: inherit;')
    };

    // --- UI Helpers ---
    function showToast(message, isError = false) {
        if (!DOM.toast) return;
        DOM.toast.innerHTML = `<i class="fas ${isError ? 'fa-exclamation-triangle' : 'fa-check-circle'}"></i> ${message}`;
        DOM.toast.classList.add('show');
        if (isError) DOM.toast.style.background = 'rgba(234, 84, 85, 0.95)';
        else DOM.toast.style.background = 'rgba(0, 207, 232, 0.95)';
        
        setTimeout(() => {
            DOM.toast.classList.remove('show');
        }, 4000);
    }

    function scrollToBottom(behavior = 'smooth') {
        if (!DOM.chatMessages) return;
        setTimeout(() => {
            DOM.chatMessages.scrollTo({
                top: DOM.chatMessages.scrollHeight,
                behavior: behavior
            });
        }, 100);
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // --- API Wrapper ---
    async function apiClient(endpoint, options = {}) {
        const timeout = 10000;
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);

        try {
            const result = await LF.api(endpoint, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(id);

            if (!result.res.ok) {
                if (result.res.status === 401) {
                    Log.auth('Session expired');
                    window.location.href = 'Login.html';
                    return null;
                }
                throw new Error(result.data?.message || `HTTP ${result.res.status}`);
            }

            if (!result.data || typeof result.data !== 'object') {
                throw new Error('Invalid JSON response');
            }

            return result.data;
        } catch (err) {
            clearTimeout(id);
            Log.api(`Request failed: ${err.message}`);
            if (err.name === 'AbortError') {
                showToast('Request timeout. Please check your connection.', true);
            }
            throw err;
        }
    }

    // --- Core Logic ---
    async function validateSession() {
        Log.auth('Validating session...');
        try {
            const session = await LF.getMe();
            if (!session?.user) {
                Log.auth('No active session found.');
                window.location.href = 'Login.html';
                return false;
            }
            state.currentUserId = session.user.id;
            Log.auth(`Logged in as user ${state.currentUserId}`);
            return true;
        } catch (err) {
            Log.auth('Session validation failed.');
            return false;
        }
    }

    function createMessageElement(msg) {
        const div = document.createElement('div');
        div.className = `bubble-row ${msg.sender}`;
        div.setAttribute('data-id', msg.id);

        const avatar = msg.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.senderName || 'U')}&background=00cfe8&color=fff`;
        const statusIcon = msg.status === 'Read' ? '<i class="fas fa-check-double"></i>' : '<i class="fas fa-check"></i>';

        const content = `
            <div class="bubble">
                <p>${escapeHtml(msg.text)}</p>
                <div class="message-info">
                    <span class="message-time">${msg.time}</span>
                    ${msg.sender === 'me' ? `<span class="message-status">${statusIcon}</span>` : ''}
                </div>
            </div>
            <img src="${avatar}" alt="avatar" class="chat-avatar-small">
        `;

        if (msg.sender === 'other') {
            div.innerHTML = `<img src="${avatar}" alt="avatar" class="chat-avatar-small">
            <div class="bubble">
                <p>${escapeHtml(msg.text)}</p>
                <div class="message-info">
                    <span class="message-time">${msg.time}</span>
                </div>
            </div>`;
        } else {
            div.innerHTML = content;
        }

        return div;
    }

    async function loadConversations() {
        Log.fetch('Loading conversations...');
        try {
            const data = await apiClient('conversations.php');
            if (!data?.success) return;

            state.apiMode = true;
            if (DOM.contactList && data.data.conversations) {
                if (data.data.conversations.length === 0) {
                    DOM.contactList.innerHTML = '<div class="empty-state">No conversations yet.</div>';
                    return;
                }

                DOM.contactList.innerHTML = data.data.conversations.map(c => `
                    <article class="contact" data-conv-id="${c.id}" data-name="${escapeHtml(c.other_name)}">
                        <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(c.other_name || 'User')}&background=00cfe8&color=fff" alt="">
                        <div class="contact-info">
                            <div class="contact-header">
                                <h4>${escapeHtml(c.other_name)}</h4>
                                <span class="time">${new Date(c.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p class="preview">${escapeHtml((c.last_message || 'Start chatting...').slice(0, 40))}</p>
                        </div>
                    </article>
                `).join('');

                // Re-bind listeners
                DOM.contactList.querySelectorAll('.contact').forEach(el => {
                    el.addEventListener('click', () => {
                        const convId = el.getAttribute('data-conv-id');
                        selectConversation(convId);
                    });
                });
            }
        } catch (err) {
            showToast('Failed to load conversations', true);
        }
    }

    async function selectConversation(convId) {
        if (state.currentConversationId === convId) return;

        state.currentConversationId = convId;
        state.lastMessageId = 0;
        
        // Update UI
        DOM.contactList?.querySelectorAll('.contact').forEach(el => {
            el.classList.toggle('active', el.getAttribute('data-conv-id') === convId);
        });

        const el = DOM.contactList?.querySelector(`.contact[data-conv-id="${convId}"]`);
        if (el) {
            DOM.chatName.textContent = el.getAttribute('data-name');
            DOM.chatAvatar.src = el.querySelector('img').src;
        }

        Log.info(`Switched to conversation ${convId}`);
        DOM.chatMessages.innerHTML = '<div class="loading-messages">Loading messages...</div>';
        
        await fetchMessages();
        startPolling();
        setupSocket();
    }

    async function fetchMessages(isPolling = false) {
        if (!state.currentConversationId || !state.isTabVisible) return;
        if (state.isLoading && !isPolling) return;

        if (!isPolling) state.isLoading = true;
        
        Log.fetch(`Fetching messages for ${state.currentConversationId}...`);
        try {
            const data = await apiClient(`messages.php?conversation_id=${state.currentConversationId}`);
            if (!data?.success) return;

            const messages = data.data.messages;
            state.currentUserId = data.data.currentUserId;

            // Simple deduplication based on ID
            const newMessages = messages.filter(m => m.id > state.lastMessageId);
            
            if (newMessages.length > 0) {
                if (state.lastMessageId === 0) {
                    DOM.chatMessages.innerHTML = '<div class="day-divider"><span>Conversation started</span></div>';
                }

                newMessages.forEach(msg => {
                    const isMe = String(msg.sender_id) === String(state.currentUserId);
                    const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    
                    const messageEl = createMessageElement({
                        id: msg.id,
                        sender: isMe ? 'me' : 'other',
                        senderName: msg.full_name,
                        text: msg.message_text,
                        time,
                        status: Number(msg.is_read) ? 'Read' : 'Delivered'
                    });
                    
                    DOM.chatMessages.appendChild(messageEl);
                    state.lastMessageId = Math.max(state.lastMessageId, msg.id);
                });

                scrollToBottom();
            }
            
            if (DOM.chatMessages.querySelector('.loading-messages')) {
                DOM.chatMessages.querySelector('.loading-messages').remove();
            }

        } catch (err) {
            if (!isPolling) showToast('Failed to load messages', true);
        } finally {
            state.isLoading = false;
        }
    }

    // --- Send Logic ---
    async function handleSendMessage(e) {
        if (e) e.preventDefault();
        const text = DOM.messageInput.value.trim();
        if (!text || state.isLoading) return;

        const params = new URLSearchParams(window.location.search);
        const itemId = DOM.chatItemIdInput?.value || params.get('item_id');
        const receiverId = DOM.chatReceiverIdInput?.value || params.get('receiver_id');

        if (!itemId && !state.currentConversationId) {
            showToast('Cannot send message: no context found.', true);
            return;
        }

        DOM.messageInput.value = '';
        Log.info('Sending message...');

        try {
            // Hybrid Send
            if (state.socket && state.socket.connected && state.currentConversationId) {
                state.socket.emit('message:send', { 
                    conversationId: state.currentConversationId, 
                    text 
                }, (ack) => {
                    if (ack?.success) fetchMessages(true);
                    else showToast('Socket send failed, retrying via API...', true);
                });
            }

            const body = new FormData();
            body.append('item_id', itemId || '');
            body.append('receiver_id', receiverId || '');
            body.append('message', text);

            const data = await apiClient('send_message.php', { method: 'POST', body });
            if (data.success) {
                if (data.data.conversation_id) {
                    state.currentConversationId = data.data.conversation_id;
                    startPolling();
                }
                await fetchMessages(true);
            }
        } catch (err) {
            showToast('Failed to send message', true);
            DOM.messageInput.value = text; // Restore text on failure
        }
    }

    // --- Real-time Logic ---
    function startPolling() {
        if (state.pollingInterval) clearInterval(state.pollingInterval);
        
        Log.info('Polling started');
        state.pollingInterval = setInterval(() => {
            if (state.socket && state.socket.connected) return; // Skip if socket is healthy
            fetchMessages(true);
        }, 3000);
    }

    async function setupSocket() {
        if (!window.io) {
            try {
                const script = document.createElement('script');
                script.src = '/socket.io/socket.io.js';
                script.onload = () => initSocket();
                document.head.appendChild(script);
            } catch (err) {
                Log.socket('Socket.IO client load failed');
            }
            return;
        }
        initSocket();
    }

    function initSocket() {
        if (state.socket) return;
        
        Log.socket('Connecting...');
        state.socket = window.io({ transports: ['websocket'], withCredentials: true });

        state.socket.on('connect', () => {
            Log.socket('Connected');
            if (state.currentConversationId) {
                state.socket.emit('conversation:join', state.currentConversationId);
            }
        });

        state.socket.on('message:new', (payload) => {
            Log.socket('New message received');
            if (String(payload.conversation_id) === String(state.currentConversationId)) {
                fetchMessages(true);
            } else {
                loadConversations(); // Update previews
            }
        });

        state.socket.on('disconnect', () => Log.socket('Disconnected'));
    }

    // --- Lifecycle ---
    function initVisibilityHandler() {
        document.addEventListener('visibilitychange', () => {
            state.isTabVisible = !document.hidden;
            if (state.isTabVisible) {
                Log.info('Tab visible, refreshing...');
                fetchMessages(true);
                loadConversations();
            }
        });
    }

    async function init() {
        Log.info('Initializing chat system...');
        
        if (!(await validateSession())) return;

        initVisibilityHandler();
        await loadConversations();

        // Handle initial selection from URL
        const params = new URLSearchParams(window.location.search);
        const urlConvId = params.get('conversation_id');
        if (urlConvId) {
            selectConversation(urlConvId);
        } else if (DOM.contactList?.querySelector('.contact')) {
            const firstId = DOM.contactList.querySelector('.contact').getAttribute('data-conv-id');
            selectConversation(firstId);
        }

        // Event Listeners
        DOM.messageForm?.addEventListener('submit', handleSendMessage);
        DOM.messageInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
            }
        });

        DOM.contactSearch?.addEventListener('input', () => {
            const term = DOM.contactSearch.value.toLowerCase();
            DOM.contactList.querySelectorAll('.contact').forEach(el => {
                const name = el.getAttribute('data-name').toLowerCase();
                el.style.display = name.includes(term) ? 'flex' : 'none';
            });
        });

        window.addEventListener('beforeunload', () => {
            if (state.pollingInterval) clearInterval(state.pollingInterval);
            if (state.socket) state.socket.disconnect();
        });

        Log.info('Chat system ready.');
    }

    // Start
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
