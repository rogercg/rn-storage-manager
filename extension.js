const vscode = require('vscode');
const wsServer = require('./websocket-server');

function activate(context) {
    console.log('Extension "RNStorageManager" is now active!');

    let storageData = [];

    let disposable = vscode.commands.registerCommand('extension.viewStorage', () => {
        const panel = vscode.window.createWebviewPanel(
            'storageViewer',
            'React Native Storage Viewer',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        function updateWebview() {
            panel.webview.html = getWebviewContent(storageData);
        }

        wsServer.onMessage = (message) => {
            console.log('Received message from RN:', message);
            if (message.type === 'STORAGE_DATA') {
                storageData = message.data;
                updateWebview();
            }
        };

        panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'updateStorage':
                        wsServer.broadcast({
                            type: 'UPDATE_VALUE',
                            data: message.data
                        });
                        break;
                    case 'refreshStorage':
                        wsServer.broadcast({
                            type: 'GET_STORAGE'
                        });
                        break;
                }
            },
            undefined,
            context.subscriptions
        );

        wsServer.start();
        updateWebview();
    });

    context.subscriptions.push(disposable);
}

function deactivate() {
    wsServer.stop();
}

function getWebviewContent(data = []) {
    const formatValue = (value) => {
        try {
            const parsed = JSON.parse(value);
            return JSON.stringify(parsed, null, 2);
        } catch {
            return value;
        }
    };

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>React Native Storage Viewer</title>
        <style>
            body { 
                padding: 20px; 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
            }
            .container { max-width: 1200px; margin: 0 auto; }
            .header { 
                display: flex; 
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
            }
            table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-top: 20px;
            }
            th, td { 
                padding: 12px; 
                text-align: left; 
                border: 1px solid #ddd;
                vertical-align: top;
            }
            th { background-color: transparent; }
            .txt_area_value {
                width: 100%;
                min-height: 100px;
                font-family: monospace;
                padding: 8px;
                border: 1px solid #ddd;
                border-radius: 4px;
            }
            button {
                padding: 8px 16px;
                background-color: #007acc;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }
            button:hover {
                background-color: #005999;
            }

            .btn_edit{
                background-color: #1bc020;
            }
            .btn_edit:hover{
                background-color: #12e212;
            }
            .btn_delete{
                background-color: #ef2222;
            }
            .btn_delete:hover{
                background-color: #d90f0f;
            }
            .btn_copy{
                background-color: #f0ce11;
            }
            .btn_copy:hover{
                background-color: #ecce56;
            }
            .controls {
                text-align: center;
                max-width: 50px;
            }
            .controls button {
                display: inline-grid;
                margin: 5px auto;
            }
            .container-txt_area {
                padding-left: 20px;
                padding-right: 40px;
            }
            .center { text-align: center;  }
            .td_key { max-width: 50px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>React Native Storage Viewer</h1>
                <button onclick="refreshStorage()">Refresh</button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Key</th>
                        <th>Value</th>
                        <th class="center">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(item => `
                        <tr>
                            <td class="td_key">${item.key}</td>
                            <td class="container-txt_area">
                                <textarea id="value-${item.key}" class="txt_area_value">${formatValue(item.value)}</textarea>
                            </td>
                            <td class="controls">
                                <button class="btn_edit" onclick="updateStorage('${item.key}')">
                                    <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                        <path fill-rule="evenodd" d="M5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7.414A2 2 0 0 0 20.414 6L18 3.586A2 2 0 0 0 16.586 3H5Zm10 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM8 7V5h8v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1Z" clip-rule="evenodd"/>
                                      </svg>                                      
                                </button>
                                <button class="btn_delete" onclick="deleteStorage('${item.key}')">
                                    <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                        <path fill-rule="evenodd" d="M8.586 2.586A2 2 0 0 1 10 2h4a2 2 0 0 1 2 2v2h3a1 1 0 1 1 0 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a1 1 0 0 1 0-2h3V4a2 2 0 0 1 .586-1.414ZM10 6h4V4h-4v2Zm1 4a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Zm4 0a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Z" clip-rule="evenodd"/>
                                      </svg>
                                </button>
                                <button class="btn_copy" onclick="copyStorage('${item.key}')">
                                    <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                        <path fill-rule="evenodd" d="M18 3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1V9a4 4 0 0 0-4-4h-3a1.99 1.99 0 0 0-1 .267V5a2 2 0 0 1 2-2h7Z" clip-rule="evenodd"/>
                                        <path fill-rule="evenodd" d="M8 7.054V11H4.2a2 2 0 0 1 .281-.432l2.46-2.87A2 2 0 0 1 8 7.054ZM10 7v4a2 2 0 0 1-2 2H4v6a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3Z" clip-rule="evenodd"/>
                                      </svg>                                      
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        <script>
            const vscode = acquireVsCodeApi();

            function updateStorage(key) {
                const value = document.getElementById('value-' + key).value;
                vscode.postMessage({
                    command: 'updateStorage',
                    data: { key, value }
                });
            }

            function deleteStorage(key) {
                vscode.postMessage({
                    command: 'deleteStorage',
                    data: { key }
                });
            }

            function refreshStorage() {
                vscode.postMessage({
                    command: 'refreshStorage'
                });
            }
            function copyStorage(key) {
                const value = document.getElementById('value-' + key).value;
                navigator.clipboard.writeText(value).then(function() {
                    console.log('Async: Copying to clipboard was successful!');
                }, function(err) {
                    console.error('Async: Could not copy text: ', err);
                });
            }
        </script>
    </body>
    </html>`;
}

module.exports = {
    activate,
    deactivate
};