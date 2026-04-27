import ImageUploader from '@/components/ImageUploader'

export default function UploadPage() {
  return (
    <div className="bg-gray-50 min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[var(--brand-primary)]">Upload Product</h1>
          <p className="text-gray-500 text-sm mt-1">AI-powered origin classification</p>
        </div>
        <ImageUploader />
      </div>
    </div>
  )
}