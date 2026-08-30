import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { useUploadThing, IMAGE_ENDPOINT } from "@/lib/uploadthing";

interface ImageUploadFieldProps {
  value: string;
  onUploaded: (url: string, key: string) => void;
  onCleared: () => void;
}

const ImageUploadField = ({ value, onUploaded, onCleared }: ImageUploadFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState(0);

  const { startUpload, isUploading } = useUploadThing(IMAGE_ENDPOINT, {
    onUploadProgress: setProgress,
    onClientUploadComplete: (res) => {
      const file = res?.[0];
      if (!file) return;
      // ufsUrl replaces the deprecated `url` field in uploadthing v7
      onUploaded(file.ufsUrl, file.key);
      setProgress(0);
      toast.success("Image uploaded");
    },
    onUploadError: (error) => {
      setProgress(0);
      toast.error(error.message || "Upload failed");
    },
  });

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) startUpload([file]);
    // reset so picking the same file twice still fires a change event
    e.target.value = "";
  };

  return (
    <div>
      <span className="label">Product image</span>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleSelect}
        className="hidden"
      />

      {value ? (
        <div className="flex items-center gap-3">
          <img
            src={value}
            alt="Product preview"
            className="h-16 w-16 shrink-0 rounded-xl border border-surface-200 object-cover"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="btn btn-ghost h-9 px-3 text-sm"
          >
            Replace
          </button>
          <button
            type="button"
            onClick={onCleared}
            disabled={isUploading}
            className="btn btn-ghost h-9 px-2 text-sm"
            aria-label="Remove image"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="field flex items-center justify-center gap-2 text-surface-500 hover:border-surface-300 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading… {progress}%
            </>
          ) : (
            <>
              <ImagePlus className="h-4 w-4" />
              Choose an image
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default ImageUploadField;
