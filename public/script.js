const editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
    lineNumbers: true,
    mode: 'javascript',
    theme: 'default',
});

const socket = io();

// Listen for the initial document state
socket.on('document', (documentState) => {
    editor.setValue(documentState);
});

// Listen for updates from the server
socket.on('update', ({ operation, documentState }) => {
    // Update the editor with the new document state
    editor.setValue(documentState);

    // Move the cursor to the end of the applied operation
    const { from, to } = operation;
    editor.setCursor(from + operation.text.length);
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
