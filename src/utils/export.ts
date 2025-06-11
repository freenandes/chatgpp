interface Message {
  id: string;
  content: string;
  role: 'human' | 'bot';
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export const exportUtils = {
  exportAsMarkdown: (conversation: Conversation): void => {
    const formatDateISO = (date: Date) => {
      return date.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM format
    };

    const formatDate = (date: Date) => {
      return date.toLocaleString();
    };

    const formatDateForFilename = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}${month}${day}${hours}${minutes}${seconds}`;
    };

    let markdown = `---\n`;
    markdown += `date: ${formatDateISO(conversation.createdAt)}\n`;
    markdown += `modified: ${formatDateISO(conversation.updatedAt)}\n`;
    markdown += `title: "${conversation.title}"\n`;
    markdown += `---\n\n`;

    conversation.messages.forEach((message, index) => {
      const roleIcon = message.role === 'human' ? '👤' : '🤖';
      const roleLabel = message.role === 'human' ? 'Human' : 'Assistant';
      
      markdown += `## ${roleIcon} ${roleLabel}\n`;
      markdown += `*${formatDate(message.timestamp)}*\n\n`;
      markdown += `${message.content}\n\n`;
      
      if (index < conversation.messages.length - 1) {
        markdown += '---\n\n';
      }
    });

    // Create and download file
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const sanitizedTitle = conversation.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const dateForFilename = formatDateForFilename(conversation.updatedAt);
    link.download = `${sanitizedTitle}-${dateForFilename}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  exportAllConversations: (conversations: Conversation[]): void => {
    const formatDateISO = (date: Date) => {
      return date.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM format
    };

    const formatDate = (date: Date) => {
      return date.toLocaleString();
    };

    const now = new Date();
    let markdown = `---\n`;
    markdown += `date: ${formatDateISO(now)}\n`;
    markdown += `modified: ${formatDateISO(now)}\n`;
    markdown += `title: "All Conversations Export"\n`;
    markdown += `---\n\n`;

    markdown += `**Total Conversations:** ${conversations.length}\n\n`;

    conversations.forEach((conversation, convIndex) => {
      markdown += `# ${conversation.title}\n\n`;
      markdown += `**Created:** ${conversation.createdAt.toLocaleString()}\n`;
      markdown += `**Last Updated:** ${conversation.updatedAt.toLocaleString()}\n`;
      markdown += `**Messages:** ${conversation.messages.length}\n\n`;

      conversation.messages.forEach((message, msgIndex) => {
        const roleIcon = message.role === 'human' ? '👤' : '🤖';
        const roleLabel = message.role === 'human' ? 'Human' : 'Assistant';
        
        markdown += `## ${roleIcon} ${roleLabel}\n`;
        markdown += `*${message.timestamp.toLocaleString()}*\n\n`;
        markdown += `${message.content}\n\n`;
        
        if (msgIndex < conversation.messages.length - 1) {
          markdown += '---\n\n';
        }
      });

      if (convIndex < conversations.length - 1) {
        markdown += '\n\n# ---\n\n';
      }
    });

    // Create and download file
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `all_conversations_${Date.now()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
