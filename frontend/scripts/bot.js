
        const apiUrl = 'https://cheapest-gpt-4-turbo-gpt-4-vision-chatgpt-openai-ai-api.p.rapidapi.com/v1/chat/completions';
        const apiKey = 'ad9ee7b333msh0e32dcd8dcad2e5p1d37fcjsnf80939de4fd8';

        const chatContainer = document.getElementById('chatContainer');
        const chatBox = document.getElementById('chatBox');
        const userInput = document.getElementById('userInput');
        const typingIndicator = document.getElementById('typingIndicator');

        // Toggle chatbot modal
        function toggleChatbot() {
            if (chatContainer.style.display === 'none' || chatContainer.style.display === '') {
                chatContainer.style.display = 'flex';  // Show the chatbot
                addMessage("Welcome to Port-Alchemy! How can I assist you?", 'bot-message');
            } else {
                chatContainer.style.display = 'none';  // Hide the chatbot
            }
        }

        // Function to display a message in the chat box
        function addMessage(message, className) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `chat-message ${className}`;
            messageDiv.textContent = message;
            chatBox.appendChild(messageDiv);
            chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom
        }

        // Send message function
        async function sendMessage() {
            const userMessage = userInput.value.trim();
            if (!userMessage) return;

            addMessage(userMessage, 'user-message');
            userInput.value = '';
            typingIndicator.style.display = 'flex'; // Show typing indicator

            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'x-rapidapi-key': apiKey,
                        'x-rapidapi-host': 'cheapest-gpt-4-turbo-gpt-4-vision-chatgpt-openai-ai-api.p.rapidapi.com',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        messages: [{ role: 'user', content: userMessage }],
                        model: 'gpt-4o',
                        max_tokens: 300,
                        temperature: 0.9
                    })
                });

                if (response.ok) {
                    const result = await response.json();
                    const botMessage = result.choices[0]?.message?.content || 'No response';
                    addMessage(botMessage, 'bot-message');
                } else {
                    addMessage('Error fetching response from the server.', 'bot-message');
                }
            } catch (error) {
                addMessage('Error fetching response from the server.', 'bot-message');
            } finally {
                typingIndicator.style.display = 'none'; // Hide typing indicator
            }
        }

        // Clear the chat history
        function clearChat() {
            chatBox.innerHTML = ''; // Clear chat content
            addMessage("Welcome to Port-Alchemy! Searching For any Stocks?", 'bot-message'); // Reset the greeting message
        }

        // Optional: Send message on Enter key press
        userInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                sendMessage();
            }
        });
    