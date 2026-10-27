import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  Image as ImageIcon,
  AlertCircle,
  Sparkles,
  RefreshCw,
  X,
  FileQuestion,
  HelpCircle,
} from 'lucide-react';
import { ScanResultData } from '../types';
import { recognizeIngredients } from '../services/gemini';

interface IngredientScannerProps {
  onScanComplete: (result: ScanResultData, previewUrl?: string) => void;
}

// Curated high-res pantry & kitchen samples for 1-click test
const SAMPLE_KITCHEN_IMAGES = [
  {
    id: 'sample_crisper',
    label: 'Fresh Produce Basket',
    description: 'Tomatoes, spinach, garlic, bell peppers, onions',
    url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'sample_pantry',
    label: 'Pantry Grains & Herbs',
    description: 'Pasta, chickpeas, olive oil, dried herbs, lemons',
    url: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'sample_fridge',
    label: 'Fridge Shelf',
    description: 'Paneer, eggs, cilantro, cucumber, yogurt',
    url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
  },
];

export const IngredientScanner: React.FC<IngredientScannerProps> = ({ onScanComplete }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [additionalNotes, setAdditionalNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convert uploaded File to Base64
  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file (JPEG, PNG, WebP).');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setErrorMessage('Image size exceeds 20MB limit. Please upload a smaller image.');
      return;
    }

    setErrorMessage(null);
    setMimeType(file.type);

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setSelectedImage(base64);
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read image file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Load sample image
  const handleSelectSample = async (sampleUrl: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      // Fetch image and convert to Base64
      const res = await fetch(sampleUrl);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setMimeType(blob.type || 'image/jpeg');
        setIsLoading(false);
      };
      reader.onerror = () => {
        setIsLoading(false);
        setErrorMessage('Failed to load sample image.');
      };
      reader.readAsDataURL(blob);
    } catch {
      setIsLoading(false);
      setErrorMessage('Error fetching sample image.');
    }
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await recognizeIngredients(selectedImage, mimeType, additionalNotes);

      if (response.success && response.data) {
        onScanComplete(response.data, selectedImage);
      } else {
        setErrorMessage(
          response.error || 'Failed to detect ingredients. Ensure the image is well-lit and contains visible food.'
        );
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Unexpected error occurred while analyzing image.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E7EFEA] text-xs font-semibold text-[#1B4332]">
          <Camera className="w-3.5 h-3.5" />
          <span>Multimodal Ingredient Vision</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#143628] tracking-tight">
          Scan Your Kitchen Ingredients
        </h1>
        <p className="text-sm text-stone-600">
          Upload a photo of your crisper drawer, grocery bag, or countertop. Gemini will detect visible ingredients and check them against your recipe matches.
        </p>
      </div>

      {/* Main Upload / Preview Area */}
      <div className="bg-white rounded-2xl border border-[#E2EBE5] p-6 sm:p-8 shadow-xs space-y-6">
        {selectedImage ? (
          /* Preview State */
          <div className="space-y-6">
            <div className="relative rounded-2xl overflow-hidden bg-stone-900 border border-stone-200 max-h-[460px] flex items-center justify-center">
              <img
                src={selectedImage}
                alt="Uploaded ingredients"
                className="max-h-[460px] w-auto object-contain"
              />
              <button
                onClick={handleClearImage}
                disabled={isLoading}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors shadow-md disabled:opacity-50"
                title="Remove photo"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Optional Context Notes */}
            <div className="space-y-1.5">
              <label htmlFor="notes" className="block text-xs font-semibold text-stone-700">
                Optional Context / Notes for Chef Gemini:
              </label>
              <input
                id="notes"
                type="text"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="e.g., 'Looking at the vegetable drawer' or 'Need quick dinner under 20 mins'"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332]"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#1B4332] text-white font-semibold shadow-md hover:bg-[#143628] transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-200" />
                    <span>Analyzing Ingredients with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                    <span>Recognize Ingredients</span>
                  </>
                )}
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="px-4 py-3 rounded-xl border border-stone-300 text-stone-700 font-medium hover:bg-stone-50 transition-colors disabled:opacity-50 text-sm"
              >
                Replace Photo
              </button>
            </div>
          </div>
        ) : (
          /* Dropzone / Upload State */
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
              isDragOver
                ? 'border-[#1B4332] bg-[#E7EFEA]/40'
                : 'border-stone-300 hover:border-stone-400 bg-stone-50/50'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-16 h-16 rounded-2xl bg-[#E7EFEA] text-[#1B4332] flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8" />
            </div>

            <h3 className="text-base font-bold text-stone-800">
              Drag and drop an ingredient photo here
            </h3>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              Supports JPEG, PNG, and WebP up to 20MB. Clear natural lighting works best.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-stone-300 text-xs font-semibold text-stone-700 shadow-xs hover:bg-stone-50">
              <ImageIcon className="w-4 h-4 text-stone-500" />
              <span>Browse Local Files</span>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileChange(e.target.files[0]);
            }
          }}
        />

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">{errorMessage}</p>
              <p className="text-red-700">
                Tip: You can also try one of our 1-click test photos below to experience full visual AI analysis immediately!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 1-Click Sample Testing Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-stone-500" />
            <h2 className="text-sm font-bold text-stone-800">
              Or Test Instantly with Sample Kitchen Photos
            </h2>
          </div>
          <span className="text-xs text-stone-500">1-click demo</span>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {SAMPLE_KITCHEN_IMAGES.map((sample) => (
            <div
              key={sample.id}
              onClick={() => handleSelectSample(sample.url)}
              className="group bg-white rounded-xl border border-[#E2EBE5] overflow-hidden p-3 shadow-xs hover:border-[#1B4332] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="h-28 rounded-lg overflow-hidden bg-stone-100 mb-2.5">
                <img
                  src={sample.url}
                  alt={sample.label}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div>
                <h4 className="font-bold text-xs text-stone-800 group-hover:text-[#1B4332] transition-colors">
                  {sample.label}
                </h4>
                <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                  {sample.description}
                </p>
              </div>
              <div className="mt-2 text-[11px] font-semibold text-[#1B4332] flex items-center gap-1">
                <span>Select Sample</span>
                <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
