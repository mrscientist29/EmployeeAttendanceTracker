import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  PDFDownloadLink,
  PDFViewer
} from '@react-pdf/renderer';

// Define styles for PDF document
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#fff',
    padding: 30,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#1E40AF',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 10,
    color: '#4B5563',
  },
  section: {
    margin: 10,
    padding: 10,
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    marginTop: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#bfbfbf',
    borderBottomStyle: 'solid',
    alignItems: 'center',
    minHeight: 30,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#bfbfbf',
    borderBottomStyle: 'solid',
    alignItems: 'center',
    minHeight: 30,
    backgroundColor: '#f0f4f8',
  },
  tableHeader: {
    padding: 5,
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333',
  },
  tableCell: {
    padding: 5,
    fontSize: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 10,
    color: '#4B5563',
  },
  generatedText: {
    fontSize: 9,
    color: '#6B7280',
    marginTop: 5,
  },
});

interface PDFDataTableProps {
  headers: string[];
  rows: string[][];
}

// PDF Data Table Component
const PDFDataTable: React.FC<PDFDataTableProps> = ({ headers, rows }) => (
  <View style={styles.table}>
    <View style={styles.tableHeaderRow}>
      {headers.map((header, index) => (
        <View 
          key={`header-${index}`} 
          style={{ 
            flex: 1, 
            borderRightWidth: index < headers.length - 1 ? 1 : 0,
            borderRightColor: '#bfbfbf', 
            borderRightStyle: 'solid',
          }}
        >
          <Text style={styles.tableHeader}>{header}</Text>
        </View>
      ))}
    </View>
    
    {rows.map((row, rowIndex) => (
      <View 
        key={`row-${rowIndex}`} 
        style={{
          ...styles.tableRow,
          backgroundColor: rowIndex % 2 ? '#fff' : '#f9fafb',
        }}
      >
        {row.map((cell, cellIndex) => (
          <View 
            key={`cell-${rowIndex}-${cellIndex}`} 
            style={{ 
              flex: 1, 
              borderRightWidth: cellIndex < row.length - 1 ? 1 : 0,
              borderRightColor: '#bfbfbf', 
              borderRightStyle: 'solid',
            }}
          >
            <Text style={styles.tableCell}>{cell}</Text>
          </View>
        ))}
      </View>
    ))}
  </View>
);

interface DataPDFDocumentProps {
  title: string;
  subtitle?: string;
  headers: string[];
  rows: string[][];
  filename?: string;
}

// PDF Document Component
export const DataPDFDocument: React.FC<DataPDFDocumentProps> = ({ 
  title, 
  subtitle,
  headers, 
  rows,
}) => {
  const currentDate = new Date().toLocaleDateString();
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        
        <View style={styles.section}>
          <PDFDataTable headers={headers} rows={rows} />
        </View>
        
        <Text style={styles.footer}>
          Employee Attendance System - {currentDate}
          {'\n'}
          <Text style={styles.generatedText}>
            Generated on {new Date().toLocaleString()}
          </Text>
        </Text>
      </Page>
    </Document>
  );
};

interface PDFExportButtonProps {
  document: React.ReactElement;
  filename: string;
}

// PDF Download Button Component
export const PDFExportButton: React.FC<PDFExportButtonProps> = ({ document, filename }) => (
  <PDFDownloadLink 
    document={document} 
    fileName={`${filename}.pdf`}
    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
  >
    {({ loading }) => (loading ? 'Generating PDF...' : 'Download PDF')}
  </PDFDownloadLink>
);

// Export a function to create a data PDF
export function createDataPDF(data: any[], title: string, subtitle?: string): React.ReactElement {
  if (data.length === 0) {
    return (
      <DataPDFDocument
        title={title}
        subtitle={subtitle || 'No data available'}
        headers={['No Data']}
        rows={[['No records found']]}
      />
    );
  }
  
  const headers = Object.keys(data[0]);
  const rows = data.map(item => headers.map(header => String(item[header] || '')));
  
  return (
    <DataPDFDocument
      title={title}
      subtitle={subtitle}
      headers={headers}
      rows={rows}
    />
  );
}