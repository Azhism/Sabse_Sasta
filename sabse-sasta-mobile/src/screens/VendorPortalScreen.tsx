import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { vendorService, VendorUpload } from '../services/vendorService';

const VendorPortalScreen = () => {
  const [uploads, setUploads] = useState<VendorUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadUploads();
  }, []);

  const loadUploads = async () => {
    try {
      const data = await vendorService.getUploads();
      setUploads(data);
    } catch (error) {
      console.error('Error loading uploads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      setUploading(true);

      const response = await vendorService.uploadCSV(
        file.uri,
        file.name,
        file.mimeType || 'text/csv'
      );

      Alert.alert(
        'Success',
        `File uploaded successfully! ${response.productsCreated} products created.`
      );
      loadUploads();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Vendor Portal</Text>
        <Text style={styles.subtitle}>Upload your product catalog</Text>

        <TouchableOpacity
          style={styles.uploadButton}
          onPress={handleUpload}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.uploadButtonText}>Upload CSV File</Text>
          )}
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upload History</Text>
          {uploads.length === 0 ? (
            <Text style={styles.emptyText}>No uploads yet</Text>
          ) : (
            uploads.map((upload) => (
              <View key={upload.id} style={styles.uploadCard}>
                <Text style={styles.uploadFileName}>{upload.fileName}</Text>
                <Text style={styles.uploadStatus}>Status: {upload.status}</Text>
                <Text style={styles.uploadDate}>
                  Uploaded: {new Date(upload.uploadedAt).toLocaleString()}
                </Text>
                {upload.processedAt && (
                  <Text style={styles.uploadDate}>
                    Processed: {new Date(upload.processedAt).toLocaleString()}
                  </Text>
                )}
              </View>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  uploadButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  uploadCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  uploadFileName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  uploadStatus: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  uploadDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default VendorPortalScreen;

