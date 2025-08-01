import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Upload, FileText, Download, CircleCheck as CheckCircle, CircleAlert as AlertCircle } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export default function BulkImportBreweriesScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [csvData, setCsvData] = useState('');

  const sampleCsvData = `name,address,phone,website,instagram,facebook,about
"Portland Craft Brewing","123 Main St, Portland, OR 97201","(503) 555-0123","https://portlandcraft.com","https://instagram.com/portlandcraft","https://facebook.com/portlandcraft","Award-winning craft brewery in the heart of Portland"
"Mountain View Ales","456 Oak Ave, Bend, OR 97702","(541) 555-0456","https://mountainviewales.com","https://instagram.com/mountainviewales","https://facebook.com/mountainviewales","Family-owned brewery with stunning mountain views"
"Coastal Hops Co","789 Beach Rd, Newport, OR 97365","(541) 555-0789","https://coastalhops.com","https://instagram.com/coastalhops","https://facebook.com/coastalhops","Ocean-inspired beers brewed with local ingredients"`;

  const handleFileSelect = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/csv',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedFile(result.assets[0]);
        // In a real app, you would read the file content here
        Alert.alert('File Selected', `Selected: ${result.assets[0].name}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select file');
    }
  };

  const handleManualImport = async () => {
    if (!csvData.trim()) {
      Alert.alert('Error', 'Please enter CSV data or select a file');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate processing CSV data
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock import results
      const mockResult: ImportResult = {
        success: 3,
        failed: 0,
        errors: []
      };
      
      setImportResult(mockResult);
      Alert.alert('Import Complete', `Successfully imported ${mockResult.success} breweries!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to import breweries');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileImport = async () => {
    if (!selectedFile) {
      Alert.alert('Error', 'Please select a CSV file first');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate file processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock import results
      const mockResult: ImportResult = {
        success: 5,
        failed: 1,
        errors: ['Row 6: Missing required field "name"']
      };
      
      setImportResult(mockResult);
      Alert.alert('Import Complete', `Successfully imported ${mockResult.success} breweries. ${mockResult.failed} failed.`);
    } catch (error) {
      Alert.alert('Error', 'Failed to import breweries');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadSampleCsv = () => {
    Alert.alert(
      'Sample CSV Format',
      'Copy the sample data below and save it as a .csv file:\n\n' + sampleCsvData,
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bulk Import Breweries</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Import Instructions</Text>
          <View style={styles.instructionCard}>
            <Text style={styles.instructionText}>
              1. Prepare your brewery data in CSV format{'\n'}
              2. Required fields: name, address, about{'\n'}
              3. Optional fields: phone, website, instagram, facebook{'\n'}
              4. Upload the file or paste CSV data below
            </Text>
          </View>
          
          <TouchableOpacity style={styles.sampleButton} onPress={downloadSampleCsv}>
            <Download size={20} color="#93bc2d" />
            <Text style={styles.sampleButtonText}>View Sample CSV Format</Text>
          </TouchableOpacity>
        </View>

        {/* File Upload */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Option 1: Upload CSV File</Text>
          
          <TouchableOpacity style={styles.fileUploadButton} onPress={handleFileSelect}>
            <Upload size={32} color="#9CA3AF" />
            <Text style={styles.fileUploadText}>
              {selectedFile ? selectedFile.name : 'Select CSV File'}
            </Text>
          </TouchableOpacity>

          {selectedFile && (
            <TouchableOpacity 
              style={[styles.importButton, isLoading && styles.importButtonDisabled]}
              onPress={handleFileImport}
              disabled={isLoading}>
              <FileText size={20} color="#000000" />
              <Text style={styles.importButtonText}>
                {isLoading ? 'Importing...' : 'Import from File'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Manual CSV Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Option 2: Paste CSV Data</Text>
          
          <TextInput
            style={styles.csvInput}
            value={csvData}
            onChangeText={setCsvData}
            placeholder="Paste your CSV data here..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={8}
            textAlignVertical="top"
          />

          <TouchableOpacity 
            style={styles.sampleDataButton}
            onPress={() => setCsvData(sampleCsvData)}>
            <Text style={styles.sampleDataButtonText}>Use Sample Data</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.importButton, isLoading && styles.importButtonDisabled]}
            onPress={handleManualImport}
            disabled={isLoading}>
            <Upload size={20} color="#000000" />
            <Text style={styles.importButtonText}>
              {isLoading ? 'Importing...' : 'Import CSV Data'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Import Results */}
        {importResult && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Import Results</Text>
            
            <View style={styles.resultCard}>
              <View style={styles.resultRow}>
                <CheckCircle size={20} color="#10B981" />
                <Text style={styles.resultText}>
                  Successfully imported: {importResult.success} breweries
                </Text>
              </View>
              
              {importResult.failed > 0 && (
                <View style={styles.resultRow}>
                  <AlertCircle size={20} color="#EF4444" />
                  <Text style={styles.resultText}>
                    Failed to import: {importResult.failed} breweries
                  </Text>
                </View>
              )}

              {importResult.errors.length > 0 && (
                <View style={styles.errorsSection}>
                  <Text style={styles.errorsTitle}>Errors:</Text>
                  {importResult.errors.map((error, index) => (
                    <Text key={index} style={styles.errorText}>• {error}</Text>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        {/* CSV Format Reference */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CSV Format Reference</Text>
          <View style={styles.formatCard}>
            <Text style={styles.formatTitle}>Required Fields:</Text>
            <Text style={styles.formatText}>• name - Brewery name</Text>
            <Text style={styles.formatText}>• address - Full address</Text>
            <Text style={styles.formatText}>• about - Description of the brewery</Text>
            
            <Text style={styles.formatTitle}>Optional Fields:</Text>
            <Text style={styles.formatText}>• phone - Phone number</Text>
            <Text style={styles.formatText}>• website - Website URL</Text>
            <Text style={styles.formatText}>• instagram - Instagram URL</Text>
            <Text style={styles.formatText}>• facebook - Facebook URL</Text>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  instructionCard: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  instructionText: {
    fontSize: 16,
    color: '#D1D5DB',
    lineHeight: 24,
  },
  sampleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#93bc2d',
    gap: 8,
  },
  sampleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#93bc2d',
  },
  fileUploadButton: {
    backgroundColor: '#374151',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4B5563',
    borderStyle: 'dashed',
    paddingVertical: 40,
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  fileUploadText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  csvInput: {
    backgroundColor: '#374151',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#4B5563',
    minHeight: 150,
    marginBottom: 12,
  },
  sampleDataButton: {
    backgroundColor: '#1F2937',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  sampleDataButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#93bc2d',
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#93bc2d',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  importButtonDisabled: {
    opacity: 0.6,
  },
  importButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  resultCard: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  resultText: {
    fontSize: 16,
    color: '#D1D5DB',
    fontWeight: '500',
  },
  errorsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#4B5563',
  },
  errorsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#F87171',
    marginBottom: 4,
  },
  formatCard: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
  },
  formatTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 8,
  },
  formatText: {
    fontSize: 14,
    color: '#D1D5DB',
    marginBottom: 4,
  },
  bottomSpacing: {
    height: 40,
  },
});