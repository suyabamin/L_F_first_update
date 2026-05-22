// Chat Application - Interactive JavaScript
(function() {
    'use strict';

    // DOM Elements
    const contacts = document.querySelectorAll('.contact');
    const chatName = document.getElementById('chatName');
    const chatAvatar = document.getElementById('chatAvatar');
    const chatStatus = document.getElementById('chatStatus');
    const chatMessages = document.getElementById('chatMessages');
    const messageForm = document.getElementById('messageForm');
    const messageInput = document.getElementById('messageInput');
    const typingIndicator = document.getElementById('typingIndicator');
    const contactSearch = document.getElementById('contactSearch');
    const newChatBtn = document.getElementById('newChatBtn');
    const callBtn = document.getElementById('callBtn');
    const videoBtn = document.getElementById('videoBtn');
    const moreBtn = document.getElementById('moreBtn');
    const attachBtn = document.getElementById('attachBtn');
    const emojiBtn = document.getElementById('emojiBtn');
    const toast = document.getElementById('toast');
    const backLink = document.querySelector('.back-link');
    const chatItemIdInput = document.getElementById('chatItemId');
    const chatReceiverIdInput = document.getElementById('chatReceiverId');

    let currentContactId = '1';
    let typingTimeout = null;
    let messageIdCounter = 7;

    // Contact data
    const contactsData = {
        '1': {
            name: 'Maya Johnson',
            avatar: 'https://randomuser.me/api/portraits/women/32.jpg',
            status: 'Online now · verifying ownership',
            messages: [
                { id: 1, sender: 'other', text: 'Hi, have you found something? I think I lost my watch near the campus gate.', time: '9:28', status: 'Read' },
                { id: 2, sender: 'me', text: 'Yes, I found a silver watch. Can you describe it so I can verify it is yours?', time: '9:30', status: 'Delivered' },
                { id: 3, sender: 'other', text: 'It has a black leather strap and a small scratch on the side.', time: '9:33', status: 'Read' },
                { id: 4, sender: 'me', text: 'That matches the item. I can hand it over after you confirm the pickup location.', time: '9:34', status: 'Read' },
                { id: 5, sender: 'other', text: 'Perfect. Meet me at the front office at 10:00.', time: '9:38', status: 'Read' },
                { id: 6, sender: 'me', text: 'Done. I will bring it there.', time: '9:40', status: 'Read' }
            ]
        },
        '2': {
            name: 'Amin Rahman',
            avatar: 'https://randomuser.me/api/portraits/men/47.jpg',
            status: 'Last seen yesterday',
            messages: [
                { id: 101, sender: 'other', text: 'I found a black wallet by the parking lot.', time: 'Yesterday', status: 'Read' }
            ]
        },
        '3': {
            name: 'Rita Das',
            avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
            status: 'Last seen Monday',
            messages: [
                { id: 201, sender: 'other', text: 'Could you confirm the serial number?', time: 'Mon', status: 'Read' }
            ]
        },
        '4': {
            name: 'Hasan Miah',
            avatar: 'https://randomuser.me/api/portraits/men/85.jpg',
            status: 'Last seen Sunday',
            messages: [
                { id: 301, sender: 'other', text: 'Thanks for returning my bag!', time: 'Sun', status: 'Read' }
            ]
        }
    };

    // Show Toast
    function showToast(message, isError = false) {
        toast.innerHTML = `<i class="fas ${isError ? 'fa-exclamation-triangle' : 'fa-check-circle'}"></i> ${message}`;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Load Chat Messages
    function loadMessages(contactId) {
        const contact = contactsData[contactId];
        if (!contact) return;

        chatName.textContent = contact.name;
        chatAvatar.src = contact.avatar;
        chatStatus.textContent = contact.status;

        // Clear messages container except the day divider
        const dayDivider = chatMessages.querySelector('.day-divider');
        chatMessages.innerHTML = '';
        if (dayDivider) chatMessages.appendChild(dayDivider);

        // Add messages
        contact.messages.forEach(msg => {
            const messageDiv = createMessageElement(msg);
            chatMessages.appendChild(messageDiv);
        });

        // Scroll to bottom
        scrollToBottom();
    }

    // Create Message Element
    function createMessageElement(msg) {
        const div = document.createElement('div');
        div.className = `bubble-row ${msg.sender}`;
        div.setAttribute('data-message-id', msg.id);

        const currentContact = contactsData[currentContactId];
        const avatar = msg.sender === 'other' ? currentContact.avatar : 'https://randomuser.me/api/portraits/men/16.jpg';
        const statusIcon = msg.status === 'Read' ? '<i class="fas fa-check-double"></i>' : '<i class="fas fa-check"></i>';

        if (msg.sender === 'other') {
            div.innerHTML = `
                <img src="${avatar}" alt="${currentContact.name} avatar">
                <div class="bubble">
                    <p>${escapeHtml(msg.text)}</p>
                    <span class="message-time">${msg.time}</span>
                    <span class="message-status">${statusIcon} ${msg.status}</span>
                </div>
            `;
        } else {
            div.innerHTML = `
                <div class="bubble">
                    <p>${escapeHtml(msg.text)}</p>
                    <span class="message-time">${msg.time}</span>
                    <span class="message-status">${statusIcon} ${msg.status}</span>
                </div>
                <img src="${avatar}" alt="Your avatar">
            `;
        }

        div.style.animation = 'messageIn 0.3s ease';
        return div;
    }

    let apiMode = false;
    let currentUserId = null;
    let currentConversationId = null;

    async function sendMessage() {
        const text = messageInput.value.trim();
        if (!text) return;

        const params = new URLSearchParams(window.location.search);
        const itemId = chatItemIdInput?.value || params.get('item_id') || '';
        const receiverId = chatReceiverIdInput?.value || params.get('receiver_id') || '';

        if (apiMode && itemId && receiverId) {
            const body = new FormData();
            body.append('item_id', itemId);
            body.append('receiver_id', receiverId);
            body.append('message', text);
            try {
                const { res, data } = await LF.api('send_message.php', { method: 'POST', body });
                if (!res.ok || !data.success) {
                    showToast(data?.message || 'Could not send message', true);
                    return;
                }
                messageInput.value = '';
                if (data.conversation_id) currentConversationId = data.conversation_id;
                await loadMessagesFromApi(currentConversationId);
                showToast('Message sent!', false);
            } catch {
                showToast('Server connection failed', true);
            }
            return;
        }

        const now = new Date();
        const time = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
        const newMessage = { id: messageIdCounter++, sender: 'me', text, time, status: 'Sent' };
        if (contactsData[currentContactId]) contactsData[currentContactId].messages.push(newMessage);
        chatMessages.appendChild(createMessageElement(newMessage));
        messageInput.value = '';
        scrollToBottom();
        showToast('Message sent!', false);
        simulateReply();
    }

    async function loadMessagesFromApi(conversationId) {
        if (!conversationId) return;
        const { res, data } = await LF.api(`messages.php?conversation_id=${conversationId}`);
        if (!res.ok || !data.success) return;
        currentUserId = data.currentUserId;
        chatMessages.innerHTML = '<div class="day-divider"><span>Today</span></div>';
        data.messages.forEach((msg) => {
            const isMe = String(msg.sender_id) === String(currentUserId);
            const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            chatMessages.appendChild(createMessageElement({
                id: msg.id,
                sender: isMe ? 'me' : 'other',
                text: msg.message_text,
                time,
                status: Number(msg.is_read) ? 'Read' : 'Delivered'
            }));
        });
        scrollToBottom();
    }

    async function bootstrapFromApi() {
        const session = await LF.getMe();
        if (!session?.user) {
            window.location.href = 'Login.html';
            return;
        }
        currentUserId = session.user.id;
        const params = new URLSearchParams(window.location.search);
        if (params.get('item_id')) chatItemIdInput.value = params.get('item_id');
        if (params.get('receiver_id')) chatReceiverIdInput.value = params.get('receiver_id');

        const { res, data } = await LF.api('conversations.php');
        if (!res.ok || !data.success) return;

        apiMode = true;
        const list = document.querySelector('.contact-list') || document.querySelector('.contacts');
        if (list && data.conversations.length) {
            list.innerHTML = data.conversations.map((c) => `
              <article class="contact" data-contact-id="${c.id}" data-name="${LF.escapeHtml(c.other_name)}">
                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(c.other_name || 'User')}&background=00cfe8&color=fff" alt="">
                <div>
                  <h4>${LF.escapeHtml(c.other_name)}</h4>
                  <p class="preview">${LF.escapeHtml((c.last_message || '').slice(0, 40))}</p>
                </div>
              </article>`);
            document.querySelectorAll('.contact').forEach((el) => {
                el.addEventListener('click', () => {
                    currentConversationId = el.getAttribute('data-contact-id');
                    chatItemIdInput.value = data.conversations.find((x) => String(x.id) === String(currentConversationId))?.item_id || '';
                    chatReceiverIdInput.value = data.conversations.find((x) => String(x.id) === String(currentConversationId))?.other_id || '';
                    loadMessagesFromApi(currentConversationId);
                });
            });
        }

        currentConversationId = params.get('conversation_id') || (data.conversations[0] && data.conversations[0].id);
        if (currentConversationId) await loadMessagesFromApi(currentConversationId);
    }

    // Simulate Typing and Reply
    function simulateReply() {
        typingIndicator.style.display = 'flex';
        
        setTimeout(() => {
            typingIndicator.style.display = 'none';
            
            const now = new Date();
            const time = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
            
            const replyMessage = {
                id: messageIdCounter++,
                sender: 'other',
                text: "Thanks for your response! I'll be there shortly.",
                time: time,
                status: 'Delivered'
            };
            
            if (contactsData[currentContactId]) {
                contactsData[currentContactId].messages.push(replyMessage);
            }
            
            const messageDiv = createMessageElement(replyMessage);
            chatMessages.appendChild(messageDiv);
            scrollToBottom();
            showToast('New message received!', false);
            
            // Update last active time
            const lastActiveSpan = document.getElementById('lastActive');
            if (lastActiveSpan) lastActiveSpan.textContent = 'Just now';
        }, 3000);
    }

    // Show typing indicator on input
    function startTyping() {
        if (typingTimeout) clearTimeout(typingTimeout);
        // In a real app, you would emit "typing" event here
        typingTimeout = setTimeout(() => {
            // Stop typing indicator
        }, 1000);
    }

    // Scroll to bottom of chat
    function scrollToBottom() {
        setTimeout(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 100);
    }

    // Switch Contact
    function switchContact(contactId, element) {
        currentContactId = contactId;
        
        // Update active class on contacts
        contacts.forEach(contact => {
            contact.classList.remove('active');
        });
        element.classList.add('active');
        
        // Remove unread badge if exists
        const unreadBadge = element.querySelector('.unread-badge');
        if (unreadBadge) unreadBadge.remove();
        
        // Load messages
        loadMessages(contactId);
        
        showToast(`Switched to ${contactsData[contactId].name}`, false);
    }

    // Search Contacts
    function searchContacts() {
        const searchTerm = contactSearch.value.toLowerCase().trim();
        const contactElements = document.querySelectorAll('.contact');
        
        contactElements.forEach(contact => {
            const name = contact.getAttribute('data-name')?.toLowerCase() || '';
            const preview = contact.querySelector('.preview')?.innerText.toLowerCase() || '';
            
            if (name.includes(searchTerm) || preview.includes(searchTerm) || searchTerm === '') {
                contact.style.display = 'grid';
            } else {
                contact.style.display = 'none';
            }
        });
    }

    // Escape HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Keyboard Shortcuts
    function initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Enter to send message
            if (e.key === 'Enter' && document.activeElement === messageInput) {
                e.preventDefault();
                messageForm?.requestSubmit();
            }
            
            // Escape to clear input
            if (e.key === 'Escape' && document.activeElement === messageInput) {
                messageInput.value = '';
                showToast('Message cleared', false);
            }
            
            // Ctrl/Cmd + K to focus search
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                if (contactSearch) {
                    contactSearch.focus();
                    showToast('Search conversations', false);
                }
            }
        });
    }

    // Initialize Contact Click Handlers
    function initContacts() {
        contacts.forEach(contact => {
            contact.addEventListener('click', () => {
                const contactId = contact.getAttribute('data-contact-id');
                if (contactId) switchContact(contactId, contact);
            });
        });
    }

    // Initialize Event Listeners
    function initEventListeners() {
        if (messageForm) {
            messageForm.addEventListener('submit', (e) => {
                e.preventDefault();
                if (!messageInput.value.trim()) return;
                const params = new URLSearchParams(window.location.search);
                if (chatItemIdInput) chatItemIdInput.value = params.get('item_id') || chatItemIdInput.value || '1';
                if (chatReceiverIdInput) chatReceiverIdInput.value = params.get('receiver_id') || chatReceiverIdInput.value || '1';
                sendMessage();
            });
        }
        
        if (messageInput) {
            messageInput.addEventListener('input', startTyping);
        }
        
        if (contactSearch) {
            contactSearch.addEventListener('input', searchContacts);
        }
        
        if (newChatBtn) {
            newChatBtn.addEventListener('click', () => {
                showToast('New conversation feature coming soon!', false);
            });
        }
        
        if (callBtn) {
            callBtn.addEventListener('click', () => {
                showToast('📞 Calling ' + chatName.textContent + '...', false);
            });
        }
        
        if (videoBtn) {
            videoBtn.addEventListener('click', () => {
                showToast('📹 Video call feature coming soon', false);
            });
        }
        
        if (moreBtn) {
            moreBtn.addEventListener('click', () => {
                showToast('More options will be available soon', false);
            });
        }
        
        if (attachBtn) {
            attachBtn.addEventListener('click', () => {
                showToast('📎 Attachment feature coming soon', false);
            });
        }
        
        if (emojiBtn) {
            emojiBtn.addEventListener('click', () => {
                showToast('😊 Emoji picker coming soon', false);
            });
        }
        
        if (backLink) {
            backLink.addEventListener('click', (e) => {
                e.preventDefault();
                showToast('Going back to conversations...', false);
            });
        }
    }

    // Auto-refresh last active time
    function initAutoRefresh() {
        setInterval(() => {
            const lastActiveSpan = document.getElementById('lastActive');
            if (lastActiveSpan && !lastActiveSpan.textContent.includes('Just now')) {
                const currentText = lastActiveSpan.textContent;
                if (currentText.includes('min')) {
                    const mins = parseInt(currentText);
                    if (!isNaN(mins)) {
                        lastActiveSpan.textContent = (mins + 1) + ' min ago';
                    }
                }
            }
        }, 60000);
    }

    // Welcome Message
    function showWelcome() {
        setTimeout(() => {
            showToast('💬 Welcome to Lost & Found Chat! Connect with item finders', false);
        }, 800);
    }

    function init() {
        initContacts();
        loadMessages(currentContactId);
        initEventListeners();
        initKeyboardShortcuts();
        initAutoRefresh();
        showWelcome();
        if (window.LF) bootstrapFromApi().catch(() => {});
    }

    init();
})();
