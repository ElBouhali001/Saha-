
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Save, X } from 'lucide-react';

interface AddProductProps {
  onClose: () => void;
  onSave: (product: any) => void;
}

const AddProduct: React.FC<AddProductProps> = ({ onClose, onSave }) => {
  const { t } = useTranslation();
  const [product, setProduct] = useState({
    name: '',
    category: '',
    description: '',
    supplier: '',
    unitPrice: '',
    minStock: '',
    maxStock: '',
    location: '',
    expiryDate: '',
    batchNumber: ''
  });

  const categories = [
    'Médicaments',
    'Matériel médical',
    'Consommables',
    'Équipements',
    'Produits d\'hygiène'
  ];

  const suppliers = [
    'Pharma CI',
    'MedEquip',
    'Biotech Supplies',
    'Medical World',
    'Health Supply Co'
  ];

  const handleInputChange = (field: string, value: string) => {
    setProduct(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // Validation des champs obligatoires
    if (!product.name || !product.category || !product.unitPrice) {
      alert(t('inventory.add_product.validation_error'));
      return;
    }

    const newProduct = {
      ...product,
      id: Date.now().toString(),
      currentStock: 0,
      unitPrice: parseFloat(product.unitPrice),
      minStock: parseInt(product.minStock) || 0,
      maxStock: parseInt(product.maxStock) || 0,
      createdAt: new Date().toISOString()
    };

    onSave(newProduct);
    onClose();
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-blue-500" />
            <span>{t('inventory.add_product.title')}</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">{t('inventory.add_product.labels.name')}</Label>
            <Input
              id="name"
              value={product.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder={t('inventory.add_product.placeholders.name')}
            />
          </div>

          <div>
            <Label htmlFor="category">{t('inventory.add_product.labels.category')}</Label>
            <Select value={product.category} onValueChange={(value) => handleInputChange('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder={t('inventory.add_product.placeholders.category')} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="description">{t('inventory.add_product.labels.description')}</Label>
          <Textarea
            id="description"
            value={product.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder={t('inventory.add_product.placeholders.description')}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="supplier">{t('inventory.add_product.labels.supplier')}</Label>
            <Select value={product.supplier} onValueChange={(value) => handleInputChange('supplier', value)}>
              <SelectTrigger>
                <SelectValue placeholder={t('inventory.add_product.placeholders.supplier')} />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier} value={supplier}>
                    {supplier}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="unitPrice">{t('inventory.add_product.labels.price')}</Label>
            <Input
              id="unitPrice"
              type="number"
              value={product.unitPrice}
              onChange={(e) => handleInputChange('unitPrice', e.target.value)}
              placeholder="0"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="minStock">{t('inventory.add_product.labels.min_stock')}</Label>
            <Input
              id="minStock"
              type="number"
              value={product.minStock}
              onChange={(e) => handleInputChange('minStock', e.target.value)}
              placeholder="0"
            />
          </div>

          <div>
            <Label htmlFor="maxStock">{t('inventory.add_product.labels.max_stock')}</Label>
            <Input
              id="maxStock"
              type="number"
              value={product.maxStock}
              onChange={(e) => handleInputChange('maxStock', e.target.value)}
              placeholder="0"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="location">{t('inventory.add_product.labels.location')}</Label>
            <Input
              id="location"
              value={product.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder={t('inventory.add_product.placeholders.location')}
            />
          </div>

          <div>
            <Label htmlFor="expiryDate">{t('inventory.add_product.labels.expiry')}</Label>
            <Input
              id="expiryDate"
              type="date"
              value={product.expiryDate}
              onChange={(e) => handleInputChange('expiryDate', e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="batchNumber">{t('inventory.add_product.labels.batch')}</Label>
          <Input
            id="batchNumber"
            value={product.batchNumber}
            onChange={(e) => handleInputChange('batchNumber', e.target.value)}
            placeholder={t('inventory.add_product.placeholders.batch')}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="outline" onClick={onClose}>
            {t('inventory.add_product.actions.cancel')}
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4 mr-2" />
            {t('inventory.add_product.actions.save')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AddProduct;
