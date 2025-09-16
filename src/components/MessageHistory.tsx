import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { MessageHistoryItem } from '../store/slices/messageHistorySlice';
import { deleteMessageFromHistory, markMessageAsSent, clearMessageHistory } from '../store/slices/messageHistorySlice';
import { History, Trash2, Send, Copy, Calendar, Clock, MapPin, Plane, MessageSquare, Download } from 'lucide-react';
import jsPDF from 'jspdf';

const MessageHistory: React.FC = () => {
  const dispatch = useAppDispatch();
  const { messages } = useAppSelector((state) => state.messageHistory);
  const [selectedMessage, setSelectedMessage] = useState<MessageHistoryItem | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleDeleteMessage = (messageId: string) => {
    dispatch(deleteMessageFromHistory(messageId));
    setShowDeleteConfirm(null);
    if (selectedMessage?.id === messageId) {
      setSelectedMessage(null);
    }
  };

  const handleMarkAsSent = (messageId: string) => {
    dispatch(markMessageAsSent(messageId));
  };

  const handleCopyMessage = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add a toast notification here
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('he-IL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFlightNumber = (flightNumber: string) => {
    return `LY${flightNumber.padStart(3, '0')}`;
  };

  const exportToPDF = (message: MessageHistoryItem) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('הודעת דחיית טיסה - Flight Delay Message', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Flight details
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('פרטי הטיסה / Flight Details:', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`מספר טיסה / Flight Number: ${formatFlightNumber(message.flightNumber)}`, 20, yPosition);
    yPosition += 8;
    doc.text(`מסלול / Route: ${message.departureCity} → ${message.arrivalCity}`, 20, yPosition);
    yPosition += 8;
    doc.text(`תאריך מקורי / Original Date: ${message.originalDate}`, 20, yPosition);
    yPosition += 8;
    doc.text(`שעה מקורית / Original Time: ${message.originalTime}`, 20, yPosition);
    yPosition += 8;
    doc.text(`שעה חדשה / New Time: ${message.newTime}`, 20, yPosition);
    if (message.newDate) {
      yPosition += 8;
      doc.text(`תאריך חדש / New Date: ${message.newDate}`, 20, yPosition);
    }
    yPosition += 15;

    // Hebrew message
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('הודעה בעברית:', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const hebrewLines = doc.splitTextToSize(message.hebrewMessage, pageWidth - 40);
    doc.text(hebrewLines, 20, yPosition);
    yPosition += hebrewLines.length * 5 + 15;

    // Check if we need a new page
    if (yPosition > pageHeight - 30) {
      doc.addPage();
      yPosition = 20;
    }

    // English message
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('English Message:', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const englishLines = doc.splitTextToSize(message.englishMessage, pageWidth - 40);
    doc.text(englishLines, 20, yPosition);

    // Footer
    const footerY = pageHeight - 20;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(`Generated on ${new Date().toLocaleString('he-IL')}`, pageWidth / 2, footerY, { align: 'center' });

    // Save the PDF
    doc.save(`flight-delay-${formatFlightNumber(message.flightNumber)}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <History className="h-6 w-6 text-blue-600 mr-3" />
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                היסטוריית הודעות
              </h3>
              <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {messages.length} הודעות
              </span>
            </div>
            {messages.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('האם אתה בטוח שברצונך למחוק את כל ההיסטוריה?')) {
                    dispatch(clearMessageHistory());
                  }
                }}
                className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                נקה הכל
              </button>
            )}
          </div>

          {messages.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">אין הודעות בהיסטוריה</h3>
              <p className="mt-1 text-sm text-gray-500">
                הודעות שתיצור יופיעו כאן
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Messages List */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900 mb-4">רשימת הודעות</h4>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedMessage?.id === message.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedMessage(message)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Plane className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {formatFlightNumber(message.flightNumber)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {message.sentAt && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              נשלח
                            </span>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDeleteConfirm(message.id);
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {message.departureCity} → {message.arrivalCity}
                        </div>
                        <div className="flex items-center mt-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(message.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Message Details */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900 mb-4">פרטי הודעה</h4>
                {selectedMessage ? (
                  <div className="space-y-4">
                    {/* Flight Details */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="text-sm font-medium text-gray-900 mb-3">פרטי הטיסה</h5>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">מספר טיסה:</span>
                          <span className="ml-2 font-medium">{formatFlightNumber(selectedMessage.flightNumber)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">מסלול:</span>
                          <span className="ml-2 font-medium">{selectedMessage.departureCity} → {selectedMessage.arrivalCity}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">תאריך מקורי:</span>
                          <span className="ml-2 font-medium">{selectedMessage.originalDate}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">שעה מקורית:</span>
                          <span className="ml-2 font-medium">{selectedMessage.originalTime}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">שעה חדשה:</span>
                          <span className="ml-2 font-medium">{selectedMessage.newTime}</span>
                        </div>
                        {selectedMessage.newDate && (
                          <div>
                            <span className="text-gray-600">תאריך חדש:</span>
                            <span className="ml-2 font-medium">{selectedMessage.newDate}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Hebrew Message */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-sm font-medium text-blue-900">הודעה בעברית</h5>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleCopyMessage(selectedMessage.hebrewMessage)}
                            className="text-blue-600 hover:text-blue-900"
                            title="העתק"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => exportToPDF(selectedMessage)}
                            className="text-red-600 hover:text-red-900"
                            title="ייצא ל-PDF"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          {!selectedMessage.sentAt && (
                            <button
                              onClick={() => handleMarkAsSent(selectedMessage.id)}
                              className="text-green-600 hover:text-green-900"
                              title="סמן כנשלח"
                            >
                              <Send className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                        {selectedMessage.hebrewMessage}
                      </pre>
                    </div>

                    {/* English Message */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-sm font-medium text-green-900">English Message</h5>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleCopyMessage(selectedMessage.englishMessage)}
                            className="text-green-600 hover:text-green-900"
                            title="Copy"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          {!selectedMessage.sentAt && (
                            <button
                              onClick={() => handleMarkAsSent(selectedMessage.id)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Mark as sent"
                            >
                              <Send className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans text-left">
                        {selectedMessage.englishMessage}
                      </pre>
                    </div>

                    {/* Template Info */}
                    {selectedMessage.templateName && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="text-sm text-gray-600">תבנית:</span>
                        <span className="ml-2 text-sm font-medium">{selectedMessage.templateName}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    בחר הודעה מהרשימה כדי לראות את הפרטים
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900">מחיקת הודעה</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  האם אתה בטוח שברצונך למחוק הודעה זו? פעולה זו לא ניתנת לביטול.
                </p>
              </div>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  ביטול
                </button>
                <button
                  onClick={() => handleDeleteMessage(showDeleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  מחק
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageHistory;
