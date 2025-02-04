# VS Code Ollama Chat Extension

A Visual Studio Code extension that integrates Ollama's AI models into VS Code through a chat interface.

## Description

This extension creates a chat interface within VS Code that connects to a local Ollama instance, allowing developers to interact with AI models directly from their development environment. The extension is built as a web extension, making it compatible with VS Code for the Web.

## Built With

- **Node.js**
- **VS Code API** - The API used to create the Visual Studio Code extension.
- **Ollama** - The AI models integrated into the chat interface.
- **Svelte**

## Dependencies

Key dependencies as defined in package.json:

```json
  "dependencies": {
    "@vscode/webview-ui-toolkit": "^1.4.0",
    "buffer": "^6.0.3",
    "marked": "^12.0.0",
    "ollama-js-client": "^1.0.2",
    "ollama-node": "^0.1.28",
    "path-browserify": "^1.0.1",
    "stream-http": "^3.2.0",
    "svelte": "^5.2.9",
    "svelte-loader": "^3.2.4",
    "url": "^0.11.4"
  }
```

## Features

- Interactive chat interface within VS Code
- Connection to local Ollama instance
- Support for multiple models
- Real-time message streaming
- Markdown rendering

## Installation

1. Clone the repository
2. Run `npm install` to install dependencies
3. Build the extension using `npm run compile-web`
4. Launch the extension in VS Code using F5

## Development Setup

The project uses the following key file:

- Main extension logic: `src/extension.ts`
- The chat interface is being created dynamically through the webview API in the `src/extension.ts` file:

```typescript
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

```

## Usage

1. Launch the extension in VS Code using F5.
2. The chat interface will be available in the VS Code sidebar.
3. Interact with the chat interface to send messages to the Ollama instance and receive responses.

## Known Issues

- Currently only supports local Ollama instances
- CORS restrictions may affect some functionality (see https://github.com/ollama/ollama/issues/116)

## Future Enhancements

- Configurable server settings
- Message history persistence
- Code snippet integration

## Project Structure

- `src/web/extension.ts`: Main extension code
- `webpack.config.js`: Build configuration
- `package.json`: Project dependencies and extension metadata
- `tsconfig.json`: TypeScript configuration
- `.vscode/`: VS Code specific settings and launch configurations

## License

This project is licensed under the MIT License.
