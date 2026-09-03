import React, { useState, useRef } from 'react';
import { db } from '../../lib/db';
import { Product, JerseyVersion, KitType, JerseySize } from '../../types';
import { useStore } from '../../contexts/StoreContext';
import { uploadAppFile, deleteAppFile, validateImageFile } from '../../lib/storage';
import { 
  ArrowLeft, Plus, Trash2, Save, Upload, Star, MoveLeft, MoveRight, 
  AlertCircle, CheckCircle2, Image as ImageIcon, Loader2, Sparkles 
} from 'lucide-react';

interface AdminProductFormProps {
  productToEdit?: Product | null;
  onCancel: () => void;
  onSaved: () => void;
}

export const AdminProductForm: React.FC<AdminProductFormProps> = ({ 
  productToEdit, 
  onCancel, 
  onSaved 
}) => {
  const { categories, showToast } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(productToEdit?.name || '');
  const [slug, setSlug] = useState(productToEdit?.slug || '');
  const [team, setTeam] = useState(productToEdit?.team || '');
  const [league, setLeague] = useState(productToEdit?.league || 'La Liga');
  const [season, setSeason] = useState(productToEdit?.season || '2025/26');
  const [jerseyVersion, setJerseyVersion] = useState<JerseyVersion>(productToEdit?.jersey_version || 'player');
  const [kitType, setKitType] = useState<KitType>(productToEdit?.kit_type || 'home');
  const [price, setPrice] = useState(productToEdit?.price ? String(productToEdit.price) : '1650');
  const [originalPrice, setOriginalPrice] = useState(productToEdit?.original_price ? String(productToEdit.original_price) : '2200');
  const [categoryId, setCategoryId] = useState(productToEdit?.category_id || categories[0]?.id || 'cat-club-europe');
  const [description, setDescription] = useState(productToEdit?.description || '');
  
  // Images state (array of image URLs / uploaded storage URLs)
  const [images, setImages] = useState<string[]>(
    productToEdit?.images && productToEdit.images.length > 0
      ? productToEdit.images
      : ['https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1000&q=85']
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Stock by sizes
  const defaultSizes: JerseySize[] = ['S', 'M', 'L', 'XL', 'XXL', '3XL'];
  const [sizeStock, setSizeStock] = useState<Record<JerseySize, number>>(() => {
    const initial: Record<JerseySize, number> = { S: 10, M: 15, L: 12, XL: 8, XXL: 5, '3XL': 2 };
    if (productToEdit) {
      productToEdit.variants.forEach(v => {
        initial[v.size] = v.stock_quantity;
      });
    }
    return initial;
  });

  const [isFeatured, setIsFeatured] = useState(productToEdit?.is_featured || false);
  const [isBestseller, setIsBestseller] = useState(productToEdit?.is_bestseller || false);
  const [isNewArrival, setIsNewArrival] = useState(productToEdit?.is_new_arrival ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!productToEdit) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  /**
   * Process multiple files selected or dropped from device
   */
  const handleFiles = async (files: FileList | File[]) => {
    setUploadError(null);
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    // Validate all files
    for (const file of fileArray) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setUploadError(validation.error || 'Invalid image file.');
        showToast(validation.error || 'Invalid image file.', 'error');
        return;
      }
    }

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of fileArray) {
        const result = await uploadAppFile({
          file,
          featureName: 'products',
          itemId: productToEdit?.id || 'new',
        });
        uploadedUrls.push(result.url);
      }

      setImages(prev => [...prev, ...uploadedUrls]);
      showToast(`${uploadedUrls.length} image(s) uploaded successfully!`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Image upload failed';
      setUploadError(msg);
      showToast(msg, 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveImage = (index: number) => {
    if (images.length <= 1) {
      showToast('At least one product image is required', 'warning');
      return;
    }
    setImages(images.filter((_, i) => i !== index));
    showToast('Image removed', 'info');
  };

  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    const targetImage = images[index];
    const newImages = [targetImage, ...images.filter((_, i) => i !== index)];
    setImages(newImages);
    showToast('Primary cover image updated', 'success');
  };

  const handleMoveImage = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    const newImages = [...images];
    const temp = newImages[index];
    newImages[index] = newImages[targetIndex];
    newImages[targetIndex] = temp;
    setImages(newImages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !team.trim() || !price) {
      showToast('Please complete all required fields', 'warning');
      return;
    }

    if (images.length === 0) {
      showToast('Please upload at least one product image', 'warning');
      return;
    }

    setIsSubmitting(true);

    const generatedVariants = defaultSizes.map((sz) => ({
      id: productToEdit?.variants.find(v => v.size === sz)?.id || `var-${Date.now()}-${sz}`,
      product_id: productToEdit?.id || '',
      size: sz,
      stock_quantity: Number(sizeStock[sz]) || 0,
      sku: `${team.toUpperCase().slice(0, 3)}-${jerseyVersion.toUpperCase().slice(0, 3)}-${sz}`
    }));

    const payload: Partial<Product> = {
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      team,
      league,
      season,
      jersey_version: jerseyVersion,
      kit_type: kitType,
      price: Number(price),
      original_price: originalPrice ? Number(originalPrice) : undefined,
      discount_price: originalPrice ? Number(price) : undefined,
      category_id: categoryId,
      description: description || `${team} official ${season} ${jerseyVersion} match kit. Crafted with high-grade breathable fabric.`,
      images,
      features: [
        'AEROREADY moisture-wicking aerodynamic weave',
        'Official 3D silicone club badge & brand heat-seal',
        'Player authentic slim-cut tournament silhouette',
        '100% Recycled Polyester high-durability yarn'
      ],
      is_featured: isFeatured,
      is_bestseller: isBestseller,
      is_new_arrival: isNewArrival,
      is_published: true,
      variants: generatedVariants,
      rating: productToEdit?.rating || 5.0,
      review_count: productToEdit?.review_count || 0
    };

    try {
      if (productToEdit) {
        await db.updateProduct(productToEdit.id, payload);
        showToast('Football jersey updated successfully!', 'success');
      } else {
        await db.createProduct(payload);
        showToast('New football jersey added to catalog!', 'success');
      }
      setIsSubmitting(false);
      onSaved();
    } catch (err: any) {
      console.error('Save product error:', err);
      showToast(err?.message || 'Failed to save product in database', 'error');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-[#1F2024]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="text-xs font-bold text-zinc-500 hover:text-zinc-900 inline-flex items-center gap-1.5 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </button>
        <h1 className="font-display text-2xl font-black text-[#1F2024] uppercase">
          {productToEdit ? 'Edit Match Kit' : 'Add New Match Kit'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Product Images Direct Upload */}
        <div className="p-6 rounded-3xl bg-white border border-[#E5E5E3] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-bold text-[#1F2024] uppercase tracking-wider">
                1. Product Images
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Upload multiple high-resolution photos directly from your device. The first image will be the primary catalog thumbnail.
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-[#F3EEFC] text-[#6D35C8] border border-[#8B5AD9]/30 rounded-lg">
              {images.length} Image{images.length !== 1 ? 's' : ''} Selected
            </span>
          </div>

          {/* Drag and drop upload container */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 ${
              isDragging
                ? 'border-[#6D35C8] bg-[#F3EEFC]/50'
                : 'border-[#E5E5E3] hover:border-[#6D35C8]/50 bg-[#F7F7F5] hover:bg-[#F7F7F5]/80'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/jpg"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {isUploading ? (
              <div className="flex flex-col items-center gap-2 py-4">
                <Loader2 className="w-8 h-8 text-[#6D35C8] animate-spin" />
                <p className="text-xs font-bold text-zinc-700">Uploading images to Supabase Storage...</p>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-[#E5E5E3] flex items-center justify-center text-[#6D35C8]">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-800">
                    Drag & drop product images here, or <span className="text-[#6D35C8] underline">Browse from device</span>
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Supports JPG, JPEG, PNG, WEBP (Max 5MB each). Select multiple files at once.
                  </p>
                </div>
              </>
            )}
          </div>

          {uploadError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Previews Gallery with Reordering and Primary Star */}
          {images.length > 0 && (
            <div className="pt-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 mb-2 block">
                Gallery Previews & Ordering:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {images.map((imgUrl, i) => {
                  const isPrimary = i === 0;
                  return (
                    <div 
                      key={i} 
                      className={`relative group rounded-xl overflow-hidden border bg-zinc-100 aspect-square transition ${
                        isPrimary ? 'border-[#6D35C8] ring-2 ring-[#6D35C8]/30' : 'border-[#E5E5E3]'
                      }`}
                    >
                      <img 
                        src={imgUrl} 
                        alt={`Preview ${i}`} 
                        className="w-full h-full object-cover" 
                        loading="lazy"
                      />

                      {/* Primary Badge */}
                      {isPrimary && (
                        <div className="absolute top-2 left-2 bg-[#6D35C8] text-white px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider shadow-xs flex items-center gap-1">
                          <Star className="w-3 h-3 fill-white" />
                          <span>Cover</span>
                        </div>
                      )}

                      {/* Controls Overlay */}
                      <div className="absolute inset-0 bg-zinc-900/60 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between">
                        <div className="flex justify-between items-center">
                          {!isPrimary && (
                            <button
                              type="button"
                              onClick={() => handleSetPrimary(i)}
                              className="px-2 py-1 bg-white/90 hover:bg-white text-zinc-900 text-[10px] font-bold rounded shadow transition flex items-center gap-1 cursor-pointer"
                              title="Set as Primary Cover"
                            >
                              <Star className="w-3 h-3 text-[#6D35C8]" />
                              <span>Set Cover</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(i)}
                            className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition ml-auto shadow cursor-pointer"
                            title="Delete Image"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Reorder Buttons */}
                        <div className="flex justify-center gap-2">
                          {i > 0 && (
                            <button
                              type="button"
                              onClick={() => handleMoveImage(i, 'left')}
                              className="p-1.5 bg-white/90 hover:bg-white text-zinc-900 rounded-lg text-xs font-bold transition shadow cursor-pointer"
                              title="Move Left"
                            >
                              <MoveLeft className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {i < images.length - 1 && (
                            <button
                              type="button"
                              onClick={() => handleMoveImage(i, 'right')}
                              className="p-1.5 bg-white/90 hover:bg-white text-zinc-900 rounded-lg text-xs font-bold transition shadow cursor-pointer"
                              title="Move Right"
                            >
                              <MoveRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Basic Details */}
        <div className="p-6 rounded-3xl bg-white border border-[#E5E5E3] shadow-xs space-y-4">
          <h2 className="font-display text-base font-bold text-[#1F2024] uppercase tracking-wider">
            2. Kit Details & Categorization
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1 block">
                Kit Title / Name <span className="text-[#6D35C8]">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Real Madrid Home 2025/26 Player Issue"
                className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-[#1F2024] placeholder-zinc-400 focus:bg-white focus:outline-none focus:border-[#6D35C8]"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1 block">
                Club / National Team <span className="text-[#6D35C8]">*</span>
              </label>
              <input
                type="text"
                required
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                placeholder="e.g. Real Madrid, Argentina, Arsenal"
                className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-[#1F2024] focus:bg-white focus:outline-none focus:border-[#6D35C8]"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1 block">
                League / Tournament
              </label>
              <input
                type="text"
                value={league}
                onChange={(e) => setLeague(e.target.value)}
                placeholder="e.g. La Liga, Premier League, FIFA World Cup"
                className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-[#1F2024] focus:bg-white focus:outline-none focus:border-[#6D35C8]"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1 block">
                Season
              </label>
              <input
                type="text"
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                placeholder="e.g. 2025/26 or 1998 Retro"
                className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-[#1F2024] font-mono focus:bg-white focus:outline-none focus:border-[#6D35C8]"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1 block">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-[#1F2024] focus:bg-white focus:outline-none focus:border-[#6D35C8] cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1 block">
                Jersey Edition / Version
              </label>
              <select
                value={jerseyVersion}
                onChange={(e) => setJerseyVersion(e.target.value as JerseyVersion)}
                className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-[#1F2024] focus:bg-white focus:outline-none focus:border-[#6D35C8] cursor-pointer"
              >
                <option value="player">Player Edition (Slim Match Cut, Heat-Seal Badges)</option>
                <option value="fan">Fan Edition (Comfort Fit, Embroidered Crest)</option>
                <option value="retro">Retro Classic (Vintage Tournament Heritage)</option>
                <option value="goalkeeper">Goalkeeper Edition</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1 block">
                Kit Type
              </label>
              <select
                value={kitType}
                onChange={(e) => setKitType(e.target.value as KitType)}
                className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-[#1F2024] focus:bg-white focus:outline-none focus:border-[#6D35C8] cursor-pointer"
              >
                <option value="home">Home Kit</option>
                <option value="away">Away Kit</option>
                <option value="third">Third Kit</option>
                <option value="special">Special / Anniversary Edition</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Pricing & Stock */}
        <div className="p-6 rounded-3xl bg-white border border-[#E5E5E3] shadow-xs space-y-4">
          <h2 className="font-display text-base font-bold text-[#1F2024] uppercase tracking-wider">
            3. Pricing (BDT ৳) & Size Stock
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1 block">
                Selling Price (BDT ৳) <span className="text-[#6D35C8]">*</span>
              </label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="1650"
                className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-[#1F2024] font-mono font-bold focus:bg-white focus:outline-none focus:border-[#6D35C8]"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1 block">
                Regular / Cross-out Price (BDT ৳)
              </label>
              <input
                type="number"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                placeholder="2200"
                className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-[#1F2024] font-mono focus:bg-white focus:outline-none focus:border-[#6D35C8]"
              />
            </div>
          </div>

          {/* Size Variant Stock Grid */}
          <div className="pt-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 mb-2 block">
              Stock Quantity by Jersey Size:
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {defaultSizes.map((sz) => (
                <div key={sz} className="p-3 bg-[#F7F7F5] rounded-xl border border-[#E5E5E3] text-center space-y-1">
                  <span className="font-mono font-black text-zinc-800 text-sm block">{sz}</span>
                  <input
                    type="number"
                    min="0"
                    value={sizeStock[sz]}
                    onChange={(e) => setSizeStock({ ...sizeStock, [sz]: Number(e.target.value) })}
                    className="w-full bg-white border border-zinc-300 rounded-lg py-1 px-2 text-center text-xs font-mono font-bold text-[#1F2024] focus:outline-none focus:border-[#6D35C8]"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 4: Description & Badges */}
        <div className="p-6 rounded-3xl bg-white border border-[#E5E5E3] shadow-xs space-y-4">
          <h2 className="font-display text-base font-bold text-[#1F2024] uppercase tracking-wider">
            4. Description & Visibility
          </h2>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1 block">
              Description & Match Heritage
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe kit details, silicone badge construction, player fit..."
              className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl p-3 text-xs text-[#1F2024] focus:bg-white focus:outline-none focus:border-[#6D35C8]"
            />
          </div>

          {/* Badges / Visibility */}
          <div className="flex flex-wrap gap-6 pt-2 text-xs font-bold text-zinc-700">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded text-[#6D35C8] focus:ring-[#6D35C8] border-zinc-300"
              />
              <span>Featured on Homepage</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isBestseller}
                onChange={(e) => setIsBestseller(e.target.checked)}
                className="rounded text-[#6D35C8] focus:ring-[#6D35C8] border-zinc-300"
              />
              <span>Mark as Bestseller</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isNewArrival}
                onChange={(e) => setIsNewArrival(e.target.checked)}
                className="rounded text-[#6D35C8] focus:ring-[#6D35C8] border-zinc-300"
              />
              <span>New Arrival</span>
            </label>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            id="save-product-btn"
            type="submit"
            disabled={isSubmitting || isUploading}
            className="px-8 py-2.5 bg-[#6D35C8] hover:bg-[#4B218A] disabled:opacity-50 text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 transition shadow-md shadow-purple-900/20 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving Kit...' : 'Save Football Kit'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
