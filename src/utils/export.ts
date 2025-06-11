
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
    const formatDate = (date: Date) => {
      return date.toLocaleString();
    };

    let markdown = `# ${conversation.title}\n\n`;
    markdown += `**Created:** ${formatDate(conversation.createdAt)}\n`;
    markdown += `**Last Updated:** ${formatDate(conversation.updatedAt)}\n`;
    markdown += `**Messages:** ${conversation.messages.length}\n\n`;
    markdown += '---\n\n';

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
    link.download = `${conversation.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  exportAllConversations: (conversations: Conversation[]): void => {
    let markdown = `# All Conversations Export\n\n`;
    markdown += `**Exported:** ${new Date().toLocaleString()}\n`;
    markdown += `**Total Conversations:** ${conversations.length}\n\n`;
    markdown += '---\n\n';

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
