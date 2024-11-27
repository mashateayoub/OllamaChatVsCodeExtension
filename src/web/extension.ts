// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { marked } from 'marked';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('ollama-chat.openChat', async () => {
		const models = await getInstalledModels();
		
		const panel = vscode.window.createWebviewPanel(
			'ollamaChatbot',
			'Ollama Chatbot',
			vscode.ViewColumn.One,
			{
			  enableScripts: true,
			  retainContextWhenHidden: true
			}
		  );
	  
		  panel.webview.html = getWebviewContent(models);
	  
		  panel.webview.onDidReceiveMessage(
			async (message) => {
			  switch (message.command) {
				case 'sendMessage':
				  const response = await sendToOllama(message.text, message.model);
				  panel.webview.postMessage({ command: 'receiveMessage', text: response });
				  break;
				case 'modelChange':
				  console.log(`Model changed to: ${message.model}`);
				  break;
			  }
			},
			undefined,
			context.subscriptions
		  );
		});

	context.subscriptions.push(disposable);
}

function getWebviewContent(models: string[]) {
	const modelOptions = models
		.map(model => `<option value="${model}">${model}</option>`)
		.join('\n');

	return `
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Ollama Chatbot</title>
			<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
			<style>
				/* Add styles for markdown content */
				.message-content {
					white-space: pre-wrap;
					word-wrap: break-word;
				}
				.message-content pre {
					background-color: var(--vscode-textCodeBlock-background);
					padding: 1em;
					border-radius: 4px;
					overflow-x: auto;
				}
				.message-content code {
					font-family: var(--vscode-editor-font-family);
					background-color: var(--vscode-textCodeBlock-background);
					padding: 0.2em 0.4em;
					border-radius: 3px;
				}
				/* Keep existing styles */
				body {
					font-family: Arial, sans-serif;
					margin: 0;
					padding: 0;
					display: flex;
					flex-direction: column;
					height: 100vh;
				}
				#model-selector {
					padding: 10px;
					background-color: var(--vscode-editor-background);
					border-bottom: 1px solid var(--vscode-panel-border);
				}
				#model-select {
					width: 200px;
					padding: 5px;
					border-radius: 3px;
					background-color: var(--vscode-input-background);
					color: var(--vscode-input-foreground);
					border: 1px solid var(--vscode-input-border);
				}
				/* Keep existing styles */
				#chat-container {
					flex: 1;
					overflow-y: auto;
					padding: 10px;
					border-bottom: 1px solid #ccc;
				}
				#input-container {
					display: flex;
					padding: 10px;
				}
				#message-input {
					flex: 1;
					padding: 5px;
					border: 1px solid #ccc;
					border-radius: 3px;
				}
				#send-button {
					margin-left: 10px;
					padding: 5px 10px;
					border: none;
					background-color: #007acc;
					color: white;
					border-radius: 3px;
					cursor: pointer;
				}
				.message {
					margin-bottom: 1em;
					padding: 0.5em;
					border-radius: 4px;
				}

				.message:nth-child(odd) {
					background-color: var(--vscode-editor-background);
				}

				.message-content {
					margin-top: 0.5em;
				}

				.message-content * {
					margin: 0.5em 0;
				}

				.message-content *:first-child {
					margin-top: 0;
				}

				.message-content *:last-child {
					margin-bottom: 0;
				}
			</style>
		</head>
		<body>
			<div id="model-selector">
				<select id="model-select">
					${modelOptions}
				</select>
			</div>
			<div id="chat-container"></div>
			<div id="input-container">
				<input type="text" id="message-input" placeholder="Type a message...">
				<button id="send-button">Send</button>
			</div>
			<script>
				const vscode = acquireVsCodeApi();
				let currentModel = '${models[0]}';

				document.getElementById('model-select').addEventListener('change', (event) => {
					currentModel = event.target.value;
					// Clear chat when model changes
					const chatContainer = document.getElementById('chat-container');
					chatContainer.innerHTML = '';
					// Notify extension about model change
					vscode.postMessage({ 
						command: 'modelChange', 
						model: currentModel 
					});
				});

				document.getElementById('send-button').addEventListener('click', () => {
					const messageInput = document.getElementById('message-input');
					const message = messageInput.value.trim();
					if (message) {
						appendMessage('You', message);
						vscode.postMessage({ 
							command: 'sendMessage', 
							text: message,
							model: currentModel
						});
						messageInput.value = '';
					}
				});

				window.addEventListener('message', event => {
					const message = event.data;
					switch (message.command) {
						case 'receiveMessage':
							appendMessage('Ollama', message.text);
							break;
					}
				});

				function appendMessage(sender, text) {
					const chatContainer = document.getElementById('chat-container');
					const messageElement = document.createElement('div');
					messageElement.className = 'message';
					
					const senderElement = document.createElement('strong');
					senderElement.textContent = sender + ': ';
					
					const contentElement = document.createElement('div');
					contentElement.className = 'message-content';
					
					// Use marked to parse markdown
					contentElement.innerHTML = marked.parse(text, {
						gfm: true, // GitHub Flavored Markdown
						breaks: true, // Convert line breaks to <br>
						sanitize: false, // Allow HTML in the markdown
						highlight: function(code, lang) {
							return code; // You can add syntax highlighting here if needed
						}
					});
					
					messageElement.appendChild(senderElement);
					messageElement.appendChild(contentElement);
					chatContainer.appendChild(messageElement);
					chatContainer.scrollTop = chatContainer.scrollHeight;
				}
			</script>
		</body>
		</html>
	`;
}
	async function sendToOllama(text: string, model: string = "llama2"): Promise<string> {
		try {
			const response = await fetch('http://127.0.0.1:11434/api/generate', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						model: model,
						prompt: text,
						stream: false
					})
				});

			if (!response.ok) {
				console.error(`HTTP error! status: ${response.status}`);
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			return data.response;
		} catch (error: unknown) {
			if (error instanceof Error) {
				console.error('Error:', error);
				return `Error: ${error.message}`;
			}
			console.error('Unknown error:', error);
			return 'An unknown error occurred';
		}
	}

async function getInstalledModels(): Promise<string[]> {
  try {
    const response = await fetch('http://127.0.0.1:11434/api/tags');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.models.map((model: { name: string }) => model.name);
  } catch (error) {
    console.error('Error fetching models:', error);
    return ['llama2']; // Fallback to default model if fetch fails
  }
}

// This method is called when your extension is deactivated
export function deactivate() {}

