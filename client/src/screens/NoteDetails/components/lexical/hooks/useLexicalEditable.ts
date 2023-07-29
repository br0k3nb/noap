import useLexicalSubscription from './useLexicalSubscription';
function subscription(editor:any) {
    return {
        initialValueFn: () => editor.isEditable(),
        subscribe: (callback:any) => {
            return editor.registerEditableListener(callback);
        },
    };
}
export default function useLexicalEditable() {
    return useLexicalSubscription(subscription);
}
