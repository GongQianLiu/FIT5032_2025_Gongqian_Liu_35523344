// Export Service for CSV and PDF export functionality
// Implements BR E.4: Export functionality

import accessibility from './accessibility.js';

export default {
  // CSV Export functionality
  csv: {
    // Convert data to CSV format
    convertToCSV(data, headers = null) {
      if (!data || data.length === 0) {
        return '';
      }

      // Auto-generate headers if not provided
      if (!headers) {
        headers = Object.keys(data[0]);
      }

      // Create CSV header row
      const csvRows = [headers.join(',')];

      // Add data rows
      for (const row of data) {
        const values = headers.map(header => {
          const value = row[header];
          if (value === null || value === undefined) {
            return '';
          }
          // Escape quotes and wrap in quotes if contains comma, quote, or newline
          const stringValue = String(value);
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        });
        csvRows.push(values.join(','));
      }

      return csvRows.join('\n');
    },

    // Download CSV file
    downloadCSV(data, filename = 'export.csv', headers = null) {
      const csvContent = this.convertToCSV(data, headers);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      this.downloadFile(blob, filename);
    },

    // Export specific data types
    exportUsers(users) {
      const headers = ['ID', 'Username', 'Email', 'Role', 'Phone', 'Address', 'Rating', 'Completed Tasks', 'Created At'];
      const data = users.map(user => ({
        'ID': user.id,
        'Username': user.username,
        'Email': user.email,
        'Role': user.role,
        'Phone': user.phone || '',
        'Address': user.address || '',
        'Rating': user.rating || '',
        'Completed Tasks': user.completedTasks || 0,
        'Created At': user.createdAt || ''
      }));
      
      this.downloadCSV(data, `users_${new Date().toISOString().split('T')[0]}.csv`, headers);
    },

    exportTasks(tasks) {
      const headers = ['ID', 'Title', 'Type', 'Status', 'Requester', 'Volunteer', 'Deadline', 'Created At', 'Rating'];
      const data = tasks.map(task => ({
        'ID': task.id,
        'Title': task.title,
        'Type': task.type,
        'Status': task.status,
        'Requester': task.requesterName || '',
        'Volunteer': task.volunteerName || '',
        'Deadline': task.deadline || '',
        'Created At': task.createdAt || '',
        'Rating': task.rating || ''
      }));
      
      this.downloadCSV(data, `tasks_${new Date().toISOString().split('T')[0]}.csv`, headers);
    },

    exportHealthServices(services) {
      const headers = ['ID', 'Name', 'Category', 'Description', 'Status', 'Address', 'Phone', 'Hours', 'Rating', 'Created At'];
      const data = services.map(service => ({
        'ID': service.id,
        'Name': service.name,
        'Category': service.category,
        'Description': service.description,
        'Status': service.status,
        'Address': service.address || '',
        'Phone': service.phone || '',
        'Hours': service.hours || '',
        'Rating': service.rating || '',
        'Created At': service.createdAt || ''
      }));
      
      this.downloadCSV(data, `health_services_${new Date().toISOString().split('T')[0]}.csv`, headers);
    },

    exportEvents(events) {
      const headers = ['ID', 'Title', 'Category', 'Date', 'Time', 'Location', 'Description', 'Status', 'Participants', 'Max Participants'];
      const data = events.map(event => ({
        'ID': event.id,
        'Title': event.title,
        'Category': event.category,
        'Date': event.date,
        'Time': event.time || '',
        'Location': event.location || '',
        'Description': event.description,
        'Status': event.status,
        'Participants': event.participants || 0,
        'Max Participants': event.maxParticipants || 50
      }));
      
      this.downloadCSV(data, `events_${new Date().toISOString().split('T')[0]}.csv`, headers);
    }
  },

  // PDF Export functionality
  pdf: {
    // Generate PDF using jsPDF (requires jsPDF library)
    async generatePDF(data, options = {}) {
      try {
        // Check if jsPDF is available
        if (typeof window.jsPDF === 'undefined') {
          throw new Error('jsPDF library not loaded. Please include jsPDF in your project.');
        }

        const { jsPDF } = window;
        const doc = new jsPDF();

        const {
          title = 'Export Report',
          subtitle = '',
          headers = [],
          filename = 'export.pdf',
          orientation = 'portrait',
          pageSize = 'a4'
        } = options;

        // Set document properties
        doc.setProperties({
          title: title,
          subject: subtitle,
          author: 'Evergreen Way System',
          creator: 'Evergreen Way Export Service'
        });

        // Add title
        doc.setFontSize(18);
        doc.text(title, 20, 20);

        if (subtitle) {
          doc.setFontSize(12);
          doc.text(subtitle, 20, 30);
        }

        // Add timestamp
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 40);

        let yPosition = 50;

        // Add data table
        if (data && data.length > 0) {
          yPosition = this.addTableToPDF(doc, data, headers, yPosition);
        }

        // Save the PDF
        doc.save(filename);
        
        return { success: true, message: 'PDF generated successfully' };
      } catch (error) {
        console.error('PDF generation failed:', error);
        return { success: false, error: error.message };
      }
    },

    // Add table to PDF
    addTableToPDF(doc, data, headers, startY) {
      const pageWidth = doc.internal.pageSize.width;
      const margin = 20;
      const tableWidth = pageWidth - (2 * margin);
      const columnCount = headers.length;
      const columnWidth = tableWidth / columnCount;

      let yPosition = startY;

      // Add headers
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      headers.forEach((header, index) => {
        const x = margin + (index * columnWidth);
        doc.text(header, x, yPosition);
      });

      yPosition += 10;

      // Add data rows
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');

      data.forEach((row, rowIndex) => {
        // Check if we need a new page
        if (yPosition > doc.internal.pageSize.height - 30) {
          doc.addPage();
          yPosition = 20;
        }

        headers.forEach((header, colIndex) => {
          const x = margin + (colIndex * columnWidth);
          const value = row[header] || '';
          const text = String(value).substring(0, 20); // Truncate long text
          doc.text(text, x, yPosition);
        });

        yPosition += 8;
      });

      return yPosition;
    },

    // Export specific data types to PDF
    async exportUsersPDF(users) {
      const headers = ['ID', 'Username', 'Email', 'Role', 'Phone', 'Rating'];
      const data = users.map(user => ({
        'ID': user.id,
        'Username': user.username,
        'Email': user.email,
        'Role': user.role,
        'Phone': user.phone || '',
        'Rating': user.rating || ''
      }));

      return await this.generatePDF(data, {
        title: 'Users Report',
        subtitle: `Total Users: ${users.length}`,
        headers: headers,
        filename: `users_${new Date().toISOString().split('T')[0]}.pdf`
      });
    },

    async exportTasksPDF(tasks) {
      const headers = ['ID', 'Title', 'Type', 'Status', 'Requester', 'Volunteer', 'Rating'];
      const data = tasks.map(task => ({
        'ID': task.id,
        'Title': task.title,
        'Type': task.type,
        'Status': task.status,
        'Requester': task.requesterName || '',
        'Volunteer': task.volunteerName || '',
        'Rating': task.rating || ''
      }));

      return await this.generatePDF(data, {
        title: 'Tasks Report',
        subtitle: `Total Tasks: ${tasks.length}`,
        headers: headers,
        filename: `tasks_${new Date().toISOString().split('T')[0]}.pdf`
      });
    },

    async exportHealthServicesPDF(services) {
      const headers = ['ID', 'Name', 'Category', 'Status', 'Address', 'Phone', 'Rating'];
      const data = services.map(service => ({
        'ID': service.id,
        'Name': service.name,
        'Category': service.category,
        'Status': service.status,
        'Address': service.address || '',
        'Phone': service.phone || '',
        'Rating': service.rating || ''
      }));

      return await this.generatePDF(data, {
        title: 'Health Services Report',
        subtitle: `Total Services: ${services.length}`,
        headers: headers,
        filename: `health_services_${new Date().toISOString().split('T')[0]}.pdf`
      });
    }
  },

  // Excel Export functionality (using SheetJS)
  excel: {
    // Generate Excel file
    async generateExcel(data, options = {}) {
      try {
        // Check if XLSX is available
        if (typeof window.XLSX === 'undefined') {
          throw new Error('SheetJS library not loaded. Please include XLSX in your project.');
        }

        const { XLSX } = window;
        const {
          sheetName = 'Sheet1',
          filename = 'export.xlsx'
        } = options;

        // Create workbook and worksheet
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(data);

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

        // Generate and download file
        XLSX.writeFile(workbook, filename);

        return { success: true, message: 'Excel file generated successfully' };
      } catch (error) {
        console.error('Excel generation failed:', error);
        return { success: false, error: error.message };
      }
    },

    // Export specific data types to Excel
    async exportUsersExcel(users) {
      const data = users.map(user => ({
        'ID': user.id,
        'Username': user.username,
        'Email': user.email,
        'Role': user.role,
        'Phone': user.phone || '',
        'Address': user.address || '',
        'Rating': user.rating || '',
        'Completed Tasks': user.completedTasks || 0,
        'Created At': user.createdAt || ''
      }));

      return await this.generateExcel(data, {
        sheetName: 'Users',
        filename: `users_${new Date().toISOString().split('T')[0]}.xlsx`
      });
    }
  },

  // Generic file download utility
  downloadFile(blob, filename) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(link.href);
  },

  // Export statistics and reports
  reports: {
    // Generate comprehensive report
    async generateComprehensiveReport(data) {
      const report = {
        generatedAt: new Date().toISOString(),
        summary: {
          totalUsers: data.users?.length || 0,
          totalTasks: data.tasks?.length || 0,
          totalServices: data.services?.length || 0,
          totalEvents: data.events?.length || 0
        },
        statistics: {
          usersByRole: this.groupBy(data.users, 'role'),
          tasksByStatus: this.groupBy(data.tasks, 'status'),
          servicesByCategory: this.groupBy(data.services, 'category'),
          eventsByCategory: this.groupBy(data.events, 'category')
        }
      };

      // Export as JSON
      const blob = new Blob([JSON.stringify(report, null, 2)], { 
        type: 'application/json' 
      });
      this.downloadFile(blob, `comprehensive_report_${new Date().toISOString().split('T')[0]}.json`);

      return report;
    },

    // Group data by property
    groupBy(data, property) {
      if (!data) return {};
      
      return data.reduce((groups, item) => {
        const key = item[property] || 'Unknown';
        groups[key] = (groups[key] || 0) + 1;
        return groups;
      }, {});
    }
  },

  // Accessibility-aware export
  accessibility: {
    // Announce export completion to screen readers
    announceExport(format, filename) {
      accessibility.screenReader.announce(
        `Export completed. ${format.toUpperCase()} file "${filename}" has been downloaded.`
      );
    },

    // Generate accessible export buttons
    generateExportButton(format, onClick, text = null) {
      const buttonText = text || `Export as ${format.toUpperCase()}`;
      const iconMap = {
        'csv': 'bi bi-file-earmark-text',
        'pdf': 'bi bi-file-earmark-pdf',
        'excel': 'bi bi-file-earmark-spreadsheet',
        'json': 'bi bi-file-earmark-code'
      };

      return `
        <button 
          class="btn btn-outline-primary btn-sm"
          onclick="${onClick}"
          aria-label="${buttonText}"
          title="${buttonText}"
        >
          <i class="${iconMap[format] || 'bi bi-download'}"></i>
          ${accessibility.screenReader.srOnly(buttonText)}
        </button>
      `;
    }
  }
};
