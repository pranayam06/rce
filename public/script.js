const editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
    lineNumbers: true,
    mode: 'javascript',
    theme: 'default',
});

const socket = io();

// Listen for updates from the server
socket.on('update', (operation) => {
    editor.replaceRange(operation.text, operation.from, operation.to);
});

// Send edits to the server
editor.on('change', (instance, change) => {
    const operation = {
        text: change.text.join('\n'),
        from: change.from,
        to: change.to,
    };
    socket.emit('edit', operation);
});