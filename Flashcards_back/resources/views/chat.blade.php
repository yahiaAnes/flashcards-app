<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Ollama 3 Chatbot - Streaming</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        .chat-container {
            max-width: 800px;
            margin: 0 auto;
            border: 1px solid #ddd;
            border-radius: 10px;
            overflow: hidden;
        }
        .chat-header {
            background-color: #4a6fa5;
            color: white;
            padding: 15px;
            text-align: center;
        }
        .chat-messages {
            height: 500px;
            overflow-y: auto;
            padding: 15px;
            background-color: #f9f9f9;
        }
        .message {
            margin-bottom: 15px;
            padding: 10px 15px;
            border-radius: 18px;
            max-width: 70%;
            word-wrap: break-word;
        }
        .user-message {
            background-color: #e3f2fd;
            margin-left: auto;
            border-bottom-right-radius: 5px;
        }
        .bot-message {
            background-color: #ffffff;
            border: 1px solid #ddd;
            margin-right: auto;
            border-bottom-left-radius: 5px;
        }
        .streaming-message {
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            margin-right: auto;
            border-bottom-left-radius: 5px;
            position: relative;
        }
        .streaming-cursor {
            animation: blink 1s infinite;
            background-color: #007bff;
            width: 2px;
            height: 1em;
            display: inline-block;
            margin-left: 2px;
        }
        @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
        }
        .chat-input {
            padding: 15px;
            background-color: #f1f1f1;
            border-top: 1px solid #ddd;
        }
        .typing-indicator {
            display: none;
            color: #666;
            font-style: italic;
            margin-bottom: 10px;
        }
        .model-selector {
            margin-bottom: 10px;
        }
        .error-message {
            color: #dc3545;
            background-color: #f8d7da;
            border-color: #f5c6cb;
        }
        .clear-chat-btn {
            margin-top: 10px;
        }
        .send-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        .streaming-indicator {
            color: #28a745;
            font-size: 0.9em;
            margin-left: 10px;
        }
    </style>
</head>
<body>
    <div class="container py-5">
        <div class="chat-container">
            <div class="chat-header">
                <h2>Ollama 3 Chatbot - Streaming</h2>
                <div class="model-selector">
                    <select id="model-select" class="form-select">
                        <option value="llama3.1:8b">Llama 3.1 8B</option>
                        <option value="mistral">Mistral</option>
                        <option value="gemma">Gemma</option>
                        <!-- Models will be loaded dynamically -->
                    </select>
                </div>
            </div>
            
            <div class="chat-messages" id="chat-messages">
                <!-- Messages will appear here -->
                <div class="typing-indicator" id="typing-indicator">
                    Ollama is typing...
                </div>
            </div>
            
            <div class="chat-input">
                <div class="input-group">
                    <input type="text" id="message-input" class="form-control" placeholder="Type your message..." autocomplete="off">
                    <button class="btn btn-primary" id="send-button">
                        Send
                        <span class="streaming-indicator" id="streaming-indicator" style="display: none;">Streaming...</span>
                    </button>
                </div>
                <button class="btn btn-outline-danger clear-chat-btn" id="clear-chat">Clear Conversation</button>
            </div>
        </div>
    </div>

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script>
        $(document).ready(function() {
            const chatMessages = $('#chat-messages');
            const messageInput = $('#message-input');
            const sendButton = $('#send-button');
            const typingIndicator = $('#typing-indicator');
            const streamingIndicator = $('#streaming-indicator');
            const modelSelect = $('#model-select');
            const clearChatBtn = $('#clear-chat');
            
            // Store conversation context
            let conversationContext = [];
            let isStreaming = false;
            let currentEventSource = null;
            let currentStreamingMessage = null;
            
            // Load models on page load
            loadAvailableModels();
            
            // Load previous messages but not context for streaming
            const savedMessages = localStorage.getItem('chatMessages');
            if (savedMessages) {
                chatMessages.html(savedMessages);
                chatMessages.find('.streaming-cursor').remove(); // Remove any leftover cursors
                chatMessages.scrollTop(chatMessages[0].scrollHeight);
            }
            
            // Handle send button click
            sendButton.click(sendMessage);
            
            // Handle Enter key
            messageInput.keypress(function(e) {
                if (e.which === 13 && !isStreaming) {
                    sendMessage();
                }
            });
            
            // Handle clear chat
            clearChatBtn.click(function() {
                if (currentEventSource) {
                    currentEventSource.close();
                    currentEventSource = null;
                }
                chatMessages.empty();
                conversationContext = [];
                isStreaming = false;
                updateUIState();
                localStorage.removeItem('chatMessages');
                addSystemMessage("Conversation cleared. Start a new one!");
            });
            
            function sendMessage() {
                if (isStreaming) return;
                
                const message = messageInput.val().trim();
                const model = modelSelect.val();
                
                if (message === '') return;
                
                // Add user message to chat
                addMessage(message, 'user');
                messageInput.val('');
                
                // Start streaming
                startStreaming(message, model);
            }
            
            function startStreaming(message, model) {
                isStreaming = true;
                updateUIState();
                
                // Create streaming message container
                currentStreamingMessage = $('<div class="message streaming-message"></div>');
                currentStreamingMessage.insertBefore(typingIndicator);
                chatMessages.scrollTop(chatMessages[0].scrollHeight);
                
                // Create EventSource for streaming
                const csrfToken = $('meta[name="csrf-token"]').attr('content');
                const url = `/chat?message=${encodeURIComponent(message)}&model=${encodeURIComponent(model)}&context=${encodeURIComponent(JSON.stringify(conversationContext))}`;
                
                // Use POST method for EventSource by creating a form
                const form = new FormData();
                form.append('message', message);
                form.append('model', model);
                form.append('context', JSON.stringify(conversationContext));
                form.append('_token', csrfToken);
                
                // Create EventSource with POST data
                currentEventSource = new EventSource('/chat?' + new URLSearchParams({
                    message: message,
                    model: model,
                    context: JSON.stringify(conversationContext)
                }));
                
                // Better approach: Use fetch with streaming
                fetch('/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                        'Accept': 'text/event-stream',
                    },
                    body: JSON.stringify({
                        message: message,
                        model: model,
                        context: conversationContext
                    })
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.body;
                })
                .then(body => {
                    const reader = body.getReader();
                    const decoder = new TextDecoder();
                    let buffer = '';
                    
                    function readStream() {
                        return reader.read().then(({ done, value }) => {
                            if (done) {
                                finishStreaming();
                                return;
                            }
                            
                            buffer += decoder.decode(value, { stream: true });
                            const lines = buffer.split('\n');
                            buffer = lines.pop(); // Keep the last incomplete line in buffer
                            
                            lines.forEach(line => {
                                if (line.startsWith('data: ')) {
                                    try {
                                        const data = JSON.parse(line.slice(6));
                                        handleStreamData(data);
                                    } catch (e) {
                                        console.error('Error parsing stream data:', e);
                                    }
                                }
                            });
                            
                            return readStream();
                        });
                    }
                    
                    return readStream();
                })
                .catch(error => {
                    console.error('Streaming error:', error);
                    handleStreamError('Connection error: ' + error.message);
                });
            }
            
            function handleStreamData(data) {
                switch (data.type) {
                    case 'chunk':
                        if (data.content) {
                            // Append content to current streaming message
                            const currentText = currentStreamingMessage.text();
                            currentStreamingMessage.html(currentText + data.content + '<span class="streaming-cursor"></span>');
                            chatMessages.scrollTop(chatMessages[0].scrollHeight);
                        }
                        break;
                        
                    case 'complete':
                        // Remove cursor and finalize message
                        currentStreamingMessage.find('.streaming-cursor').remove();
                        currentStreamingMessage.removeClass('streaming-message').addClass('bot-message');
                        
                        // Update context
                        if (data.context) {
                            conversationContext = data.context;
                        }
                        
                        finishStreaming();
                        break;
                        
                    case 'error':
                        handleStreamError(data.error);
                        break;
                }
            }
            
            function handleStreamError(errorMessage) {
                if (currentStreamingMessage) {
                    currentStreamingMessage.removeClass('streaming-message')
                                           .addClass('bot-message error-message')
                                           .text('Error: ' + errorMessage);
                    currentStreamingMessage.find('.streaming-cursor').remove();
                }
                finishStreaming();
            }
            
            function finishStreaming() {
                isStreaming = false;
                currentStreamingMessage = null;
                if (currentEventSource) {
                    currentEventSource.close();
                    currentEventSource = null;
                }
                updateUIState();
                
                // Save messages to localStorage
                localStorage.setItem('chatMessages', chatMessages.html());
            }
            
            function updateUIState() {
                if (isStreaming) {
                    sendButton.prop('disabled', true);
                    messageInput.prop('disabled', true);
                    streamingIndicator.show();
                } else {
                    sendButton.prop('disabled', false);
                    messageInput.prop('disabled', false);
                    streamingIndicator.hide();
                }
            }
            
            function addMessage(text, sender, isError = false) {
                const messageClass = sender === 'user' ? 'user-message' : 
                                    isError ? 'bot-message error-message' : 'bot-message';
                const messageElement = $('<div class="message ' + messageClass + '">' + text + '</div>');
                
                // Append message and scroll to bottom
                messageElement.insertBefore(typingIndicator);
                chatMessages.scrollTop(chatMessages[0].scrollHeight);
                
                // Save messages to localStorage
                localStorage.setItem('chatMessages', chatMessages.html());
            }
            
            function addSystemMessage(text) {
                const messageElement = $('<div class="message text-center text-muted">' + text + '</div>');
                messageElement.insertBefore(typingIndicator);
                chatMessages.scrollTop(chatMessages[0].scrollHeight);
                localStorage.setItem('chatMessages', chatMessages.html());
            }
            
            function loadAvailableModels() {
                $.ajax({
                    url: '/chat/models',
                    method: 'GET',
                    success: function(response) {
                        if (response.success && response.models) {
                            // Clear existing options except the first one
                            modelSelect.find('option:not(:first)').remove();
                            
                            // Add new models
                            response.models.forEach(model => {
                                if (model.name) {
                                    const modelName = model.name.split(':')[0]; // Remove version tag
                                    if (!modelSelect.find('option[value="' + modelName + '"]').length) {
                                        modelSelect.append($('<option>', {
                                            value: modelName,
                                            text: modelName.charAt(0).toUpperCase() + modelName.slice(1)
                                        }));
                                    }
                                }
                            });
                        }
                    },
                    error: function(xhr) {
                        console.error("Failed to load models:", xhr.responseText);
                    }
                });
            }
        });
    </script>
</body>
</html>