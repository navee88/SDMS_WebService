import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import AnimatedDropdown from '../../../../Layout/Common/AnimatedDropdown.jsx';
import Errordialog from '../../../../Layout/Common/Errordialog.jsx';

const ChatInterface = ({ 
    selectedUser, 
    activeUsers, 
    onUserSelect, 
    onClose,
    getApiRequestData,
    postData,
    showInfoDialog,
    t 
}) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [messageError, setMessageError] = useState(false);
    const [sendingMessage, setSendingMessage] = useState(false);
    const [loading, setLoading] = useState(true);
    const [infoDialog, setInfoDialog] = useState({
        open: false,
        message: "",
        type: "information"
    });
    
    // Add confirmation dialog state
    const [confirmationDialog, setConfirmationDialog] = useState({
        open: false,
        message: "",
        type: "confirmationlogout",
        showCancel: true,
        reverseButtons: false,
        onConfirm: null,
        onCancel: null
    });
    
    const messagesEndRef = useRef(null);
    const pollingIntervalRef = useRef(null);
    const [show, setShow] = useState(true);
    const initialLoadRef = useRef(true);

    // Scroll to bottom of messages - ONLY ON INITIAL LOAD
    useEffect(() => {
        if (messagesEndRef.current && initialLoadRef.current && messages.length > 0) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
            initialLoadRef.current = false;
        }
    }, [messages, loading]);

    // Local dialog functions
    const showInfoDialogLocal = useCallback((message, type = "information") => {
        setInfoDialog({
            open: true,
            message,
            type
        });
    }, []);
    
    const handleClose = () => {
        setMessages([]);
        onClose();
    }
    
    const closeInfoDialogLocal = useCallback(() => {
        setInfoDialog(prev => ({
            ...prev,
            open: false
        }));
    }, []);

    // Confirmation dialog handlers
    const showConfirmationDialog = useCallback((message, onConfirm, onCancel = null) => {
        setConfirmationDialog({
            open: true,
            message,
            type: "confirmationlogout",
            showCancel: true,
            reverseButtons: true,
            onConfirm,
            onCancel
        });
    }, []);
    
    const closeConfirmationDialog = useCallback(() => {
        setConfirmationDialog(prev => ({
            ...prev,
            open: false
        }));
    }, []);
    
    const handleDialogConfirm = useCallback(() => {
        if (confirmationDialog.onConfirm) {
            confirmationDialog.onConfirm();
        }
        closeConfirmationDialog();
    }, [confirmationDialog.onConfirm, closeConfirmationDialog]);
    
    const handleDialogCancel = useCallback(() => {
        if (confirmationDialog.onCancel) {
            confirmationDialog.onCancel();
        }
        closeConfirmationDialog();
    }, [confirmationDialog.onCancel, closeConfirmationDialog]);

    // Parse HTML chat history into message objects
    const parseChatHistory = useCallback((htmlContent) => {
        if (!htmlContent || typeof htmlContent !== 'string') {
            return [];
        }

        const messages = [];
        
        // Split by newline to get each message div
        const messageLines = htmlContent.split('\n').filter(line => line.trim() !== '');
        
        messageLines.forEach((line, index) => {
            try {
                // Check if it's a fromtxtdiv (sent message) or totxtdiv (received message)
                if (line.includes('fromtxtdiv') || line.includes('totxtdiv')) {
                    // Extract user information
                    let sender = "";
                    let isOwn = false;
                    
                    if (line.includes('fromtxtdiv')) {
                        isOwn = true;
                        const sentToMatch = line.match(/Sent To <span class='clstouser'>(.*?)<\/span>/);
                        sender = sentToMatch ? sentToMatch[1] : "Unknown";
                    } else if (line.includes('totxtdiv')) {
                        isOwn = false;
                        const receivedFromMatch = line.match(/Received From <span class='clsfromuser'>(.*?)<\/span>/);
                        sender = receivedFromMatch ? receivedFromMatch[1] : "Unknown";
                    }
                    
                    // Extract message text
                    const messageMatch = line.match(/<div class='(fromvalspan|tovalspan)'>(.*?)<\/div>/);
                    const text = messageMatch ? messageMatch[2] : "";
                    
                    // Extract timestamp
                    const dateMatch = line.match(/<div class='clsdateformat'>(.*?)<\/div>/);
                    const timestamp = dateMatch ? dateMatch[1] : "";
                    
                    if (text && sender && timestamp) {
                        // Format sender name for display
                        const displaySender = isOwn ? "You" : sender;
                        
                        messages.push({
                            id: index + 1,
                            sender: displaySender,
                            originalSender: sender,
                            text: text,
                            timestamp: timestamp,
                            isOwn: isOwn
                        });
                    }
                }
            } catch (error) {
                console.error('Error parsing chat line:', error);
            }
        });

        return messages;
    }, []);

    // Fetch chat history
    const fetchChatHistory = useCallback(async (toUserID = null) => {
        try {
            const requestData = getApiRequestData({
                sActionType: "View",
                ...(toUserID && { sToUserID: toUserID })
            });
            
            const response = await postData("chatmessages/getChatHistory", requestData);
            
            if (response && response.ChatHistory) {
                if (typeof response.ChatHistory === 'string') {
                    const parsedMessages = parseChatHistory(response.ChatHistory);
                    setMessages(parsedMessages);
                } else {
                    setMessages([]);
                }
            } else {
                setMessages([]);
            }
        } catch (error) {
            console.error('Error fetching chat history:', error);
            setMessages([]);
        } finally {
            setLoading(false);
        }
    }, [postData, getApiRequestData, parseChatHistory]);

    // Start real-time polling
    const startRealTimePolling = useCallback(() => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
        }

        // Fetch immediately
        if (selectedUser?.L02UserID) {
            fetchChatHistory(selectedUser.L02UserID);
        }

        // Set up polling every 5 seconds
        pollingIntervalRef.current = setInterval(() => {
            if (selectedUser?.L02UserID) {
                fetchChatHistory(selectedUser.L02UserID);
            }
        }, 5000);
    }, [selectedUser, fetchChatHistory]);

    // Send message
    const handleSendMessage = useCallback(async () => {
        if (!newMessage.trim()) {
            setMessageError(true);
            return;
        }
        
        if (!selectedUser) return;
        
        setMessageError(false);
        
        try {
            setSendingMessage(true);
            
            const requestData = getApiRequestData({
                sToUserName: selectedUser.L02UserFullName,
                sMessage: newMessage
            });
            
            const response = await postData("chatmessages/sendMessage", requestData);
            
            if (response && response.Rtn === "Success") {
                setNewMessage('');
                await fetchChatHistory(selectedUser.L02UserID);
                showInfoDialogLocal(t('usermanagement.messagesent') || "Message sent successfully", "success");
            } else {
                showInfoDialogLocal(response?.Message || response?.returnMsg || t('usermanagement.messagesentfailed'), "error");
            }
            
        } catch (error) {
            console.error('Error sending message:', error);
            showInfoDialogLocal(t('usermanagement.messagesentfailed') || "Failed to send message", 'error');
        } finally {
            setSendingMessage(false);
        }
    }, [newMessage, selectedUser, postData, getApiRequestData, fetchChatHistory, showInfoDialogLocal, t]);

    // Clear chat history with confirmation dialog
    const handleClearHistory = useCallback(async () => {
        if (messages.length === 0) {
            showInfoDialogLocal(t('usermanagement.youhavenohistoryhere') || "You have no history here", "warning");
            return;
        }
        
        // Show confirmation dialog instead of window.confirm
        showConfirmationDialog(
            t('usermanagement.chatconfirmation') || "Are you sure you want to clear chat history?",
            async () => {
                try {
                    const requestData = getApiRequestData();
                    
                    const response = await postData("chatmessages/clearChatHistory", requestData);
                    
                    if (response && response.Rtn === "Success") {
                        setMessages([]);
                        showInfoDialogLocal(t('usermanagement.chathistorydeletesuccess') || "Chat history deleted successfully", "success");
                    } else {
                        showInfoDialogLocal(response?.Message || response?.returnMsg || t('usermanagement.clearchatfailed'), "error");
                    }
                } catch (error) {
                    console.error('Error clearing chat history:', error);
                    showInfoDialogLocal(t('usermanagement.clearchatfailed') || "Failed to clear chat history", 'error');
                }
            }
        );
    }, [messages, postData, getApiRequestData, showInfoDialogLocal, t, showConfirmationDialog]);

    const handleClearMessage = useCallback(() => {
        setNewMessage('');
    }, []);

    // Initialize real-time polling when component mounts or selectedUser changes
    useEffect(() => {
        startRealTimePolling();
        
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, [startRealTimePolling]);

    // Restart polling when selected user changes
    useEffect(() => {
        if (selectedUser?.L02UserID) {
            startRealTimePolling();
        }
    }, [selectedUser, startRealTimePolling]);

    return (
        <div className="h-full flex flex-col bg-white relative">
            {/* Local Errordialog for chat-specific messages */}
            {infoDialog.open && (
                <Errordialog
                    message={infoDialog.message}
                    type={infoDialog.type}
                    onClose={closeInfoDialogLocal}
                />
            )}

            {/* Confirmation Dialog for Clear History */}
            {confirmationDialog.open && (
                <Errordialog
                    message={confirmationDialog.message}
                    type={confirmationDialog.type} // This is now "confirmationlogout"
                    showCancel={confirmationDialog.showCancel}
                    reverseButtons={confirmationDialog.reverseButtons}
                    onClose={closeConfirmationDialog}
                    onCancel={handleDialogCancel}
                    onConfirm={handleDialogConfirm}
                    // Optional: You can customize the button texts if needed
                    okText={t("button.yes") || "Yes"}
                    cancelText={t("button.no") || "No"}
                />
            )}

            {/* Chat Content - 65%/35% fixed split */}
            <div className="flex-1 flex p-4 gap-2 overflow-hidden">
                {/* Messages Inbox - 65% width */}
                <div className="w-[65%] h-full flex flex-col">
                    {/* Messages Header with Clear button */}
                    <div className="flex items-center justify-between mb-2 p-1">
                        <span className="text-sm font-roboto font-bold text-[#0049b0]">
                            {t('usermanagement.messages') || "Messages"}
                        </span>
                        <button
                            onClick={handleClearHistory}
                            type="button"
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold rounded border-none bg-[#f0f2f5] text-[#2883fe] hover:bg-[#E6F0FF] transition-all"
                        >
                            <i className="fa fa-eraser text-[#2883fe] font-bold text-sm"></i>
                            <span className="text-[#2883fe] font-roboto text-[11px] font-bold">
                                {t('button.clear') || "Clear"}
                            </span>
                        </button>
                    </div>
                    
                    {/* Messages Container */}
                    <div className="flex-1 overflow-auto border border-gray-300 rounded-lg bg-white p-1">
                        {loading ? (
                            <div className="h-full flex flex-col items-center justify-center">
                                <div className="text-center text-gray-500">
                                    {t("common.loading") || "Loading messages..."}
                                </div>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center">
                                <h2 className="text-center text-gray-300 text-lg">
                                    {t('usermanagement.nomessage') || "No Message"}
                                    <i className="fa fa-frown-o ml-2"></i>
                                </h2>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`mb-2 ${message.isOwn ? 'flex justify-end' : 'flex justify-start'}`}
                                    >
                                        <div 
                                            className={`
                                                ${message.isOwn 
                                                    ? 'border-l-[5px] border-l-[#3388cc] rounded-lg' 
                                                    : 'border-l-[5px] border-l-green-700 rounded-lg'
                                                } 
                                                p-1 rounded-r 
                                                break-words overflow-hidden
                                                w-[65%]
                                            `}
                                            style={{ 
                                                wordBreak: 'break-word',
                                                overflowWrap: 'break-word'
                                            }}
                                        >
                                            {/* Message header with sender */}
                                            <div className="font-bold text-sm mb-0">
                                                <span className={`${
                                                    message.isOwn 
                                                        ? 'text-[#3388cc] font-["helvetica"] text-sm' 
                                                        : 'text-green-700 font-["helvetica"] text-sm'
                                                }`}>
                                                    <i>{message.isOwn ? 'Sent To' : 'Received From'} {message.originalSender}</i>
                                                </span>
                                            </div>
                                            
                                            {/* Timestamp */}
                                            <div className="text-[11px] text-[#808080] font-['helvetica'] mb-0">
                                                {message.timestamp}
                                            </div>
                                            
                                            {/* Message text */}
                                            <div 
                                                className="text-[18px] text-[#333333] font-['helvetica']"
                                                style={{
                                                    wordBreak: 'break-word',
                                                    whiteSpace: 'normal',
                                                    overflowWrap: 'break-word'
                                                }}
                                            >
                                                {message.text}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>
                    <div ref={messagesEndRef} />
                </div>

                {/* Send Message Panel - 35% width */}
                <div className="w-[35%] h-full flex flex-col pt-12">
                    {/* Form Fields */}
                    <div className="flex-1">
                        {/* To Field */}
                        <div className="mb-6">
                            <label className="mb-1 block text-[12px] font-roboto text-[#405F7D] font-semibold">
                                {t('usermanagement.to') || "To"} 
                                <span className="text-red-500 ml-1">*</span>
                            </label>
                            <AnimatedDropdown
                                name="toUser"
                                value={selectedUser?.L02UserID || ''}
                                options={activeUsers}
                                onChange={onUserSelect}
                                displayKey="name"
                                valueKey="id"
                                allowFreeInput
                                required={true}
                                showError={false}
                                disabled={sendingMessage}
                            />
                        </div>

                        {/* Message Field */}
                        <div className="mb-2">
                            <label className="mb-1 block text-[12px] font-roboto text-[#405F7D] font-semibold">
                                {t('usermanagement.message') || "Message"} 
                                <span className="text-red-500 ml-1">*</span>
                            </label>
                            <textarea
                                value={newMessage}
                                onChange={(e) => {
                                    setNewMessage(e.target.value);
                                    if (messageError && e.target.value.trim()) {
                                        setMessageError(false);
                                    }
                                }}
                                className={`w-full h-[280px] p-2 border rounded focus:outline-none focus:ring-2 focus:border-transparent resize-none text-sm ${
                                    messageError 
                                        ? 'border-red-500 focus:ring-red-500' 
                                        : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                                }`}
                                disabled={sendingMessage}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                                style={{
                                    wordBreak: 'break-word',
                                    overflowWrap: 'break-word',
                                    whiteSpace: 'pre-wrap'
                                }}
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim() || sendingMessage || !selectedUser}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold rounded border-none bg-[#f0f2f5] text-[#2883fe] hover:bg-[#E6F0FF] transition-all disabled:cursor-not-allowed"
                        >
                            <i className="fa fa-paper-plane-o font-bold text-sm "></i>
                            <span>{t('button.send') || "Send"}</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleClearMessage}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold rounded border-none bg-[#f0f2f5] text-[#2883fe] hover:bg-[#E6F0FF] transition-all"
                        >
                            <i className="fa fa-eraser font-bold text-sm"></i>
                            <span>{t('button.clear') || "Clear"}</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold rounded border-none bg-[#f0f2f5] text-[#2883fe] hover:bg-[#E6F0FF] transition-all"
                        >
                            <span>{t('button.close') || "Close"}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;