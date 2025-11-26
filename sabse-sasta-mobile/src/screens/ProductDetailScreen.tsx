import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { productService, Product } from '../services/productService';
import { useCart } from '../contexts/CartContext';

type ProductDetailScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const ProductDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation<ProductDetailScreenNavigationProp>();
  const { productId } = route.params as { productId: string };
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [comparisonProducts, setComparisonProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      const productData = await productService.getById(productId);
      setProduct(productData);
      
      // Get price comparison for the same product name
      if (productData.name) {
        const comparison = await productService.compare(productData.name, productData.brand || undefined);
        setComparisonProducts(comparison);
      }
    } catch (error) {
      console.error('Error loading product:', error);
      Alert.alert('Error', 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        id: product.id,
        productId: product.id,
        name: product.name,
        category: product.category,
        brand: product.brand || '',
        size: product.size,
        price: Number(product.price),
        vendor: product.vendor,
      });
      Alert.alert('Success', 'Product added to cart');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.center}>
        <Text>Product not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{product.name}</Text>
        <Text style={styles.brand}>{product.brand || 'Unknown Brand'}</Text>
        <Text style={styles.price}>₹{Number(product.price).toFixed(2)}</Text>

        <View style={styles.details}>
          <Text style={styles.label}>Category:</Text>
          <Text style={styles.value}>{product.category}</Text>
        </View>

        {product.subcategory && (
          <View style={styles.details}>
            <Text style={styles.label}>Subcategory:</Text>
            <Text style={styles.value}>{product.subcategory}</Text>
          </View>
        )}

        <View style={styles.details}>
          <Text style={styles.label}>Size:</Text>
          <Text style={styles.value}>{product.size}</Text>
        </View>

        <View style={styles.details}>
          <Text style={styles.label}>Vendor:</Text>
          <Text style={styles.value}>{product.vendor}</Text>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
          <Text style={styles.addButtonText}>Add to Cart</Text>
        </TouchableOpacity>

        {comparisonProducts.length > 1 && (
          <View style={styles.comparison}>
            <Text style={styles.comparisonTitle}>Price Comparison</Text>
            {comparisonProducts.map((p) => (
              <View key={p.id} style={styles.comparisonItem}>
                <Text style={styles.comparisonVendor}>{p.vendor}</Text>
                <Text style={styles.comparisonPrice}>₹{Number(p.price).toFixed(2)}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  brand: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 20,
  },
  details: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    width: 120,
  },
  value: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  comparison: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  comparisonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  comparisonItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  comparisonVendor: {
    fontSize: 16,
    color: '#333',
  },
  comparisonPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProductDetailScreen;

