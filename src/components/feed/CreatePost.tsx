"use client";

import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, X, Loader2 } from "lucide-react";
import { createPostAction } from "@/actions/post.actions";
import { usePostStore } from "@/store/usePostStore";
import { useSession } from "next-auth/react";
import Image from "next/image";

import imageCompression from 'browser-image-compression';

export function CreatePost({ onSuccess }: { onSuccess?: () => void }) {
  const { data: session } = useSession();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addPost = usePostStore(state => state.addPost);

  if (!session?.user) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/") || f.type.startsWith("video/"));
      if (files.length > 0) {
        setSelectedFiles(prev => [...prev, ...files]);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async () => {
    if (!content.trim() && selectedFiles.length === 0) return;
    
    setIsSubmitting(true);
    try {
      // 1. Compress images and convert to base64
      const mediaBase64 = [];
      for (const file of selectedFiles) {
        if (file.type.startsWith('image/')) {
          const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true
          };
          const compressedFile = await imageCompression(file, options);
          const base64 = await fileToBase64(compressedFile);
          mediaBase64.push(base64);
        } else {
          // Send video as is (note: Vercel might limit large video uploads via Server Actions)
          const base64 = await fileToBase64(file);
          mediaBase64.push(base64);
        }
      }

      // 2. Create post via Server Action
      const newPost = await createPostAction({
        content,
        mediaBase64,
      });
      
      addPost(newPost);
      setContent("");
      setSelectedFiles([]);
      if (onSuccess) onSuccess();
    } catch (e) {
      console.error("Error creating post:", e);
      alert("Failed to create post. Pastikan ukuran file tidak terlalu besar.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="p-4 border-b"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="flex gap-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={session.user.image ?? ""} alt={session.user.name ?? ""} />
          <AvatarFallback>{session.user.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What is happening?! (You can drop images here)" 
            className="w-full bg-transparent outline-none resize-none min-h-[50px] text-[15px]"
            maxLength={280}
          />
          
          {selectedFiles.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="relative aspect-video rounded-xl overflow-hidden bg-muted">
                  <button onClick={() => removeFile(index)} className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full z-10 hover:bg-black/70">
                    <X size={16} />
                  </button>
                  <img 
                    src={URL.createObjectURL(file)} 
                    alt="Preview" 
                    className="object-cover w-full h-full" 
                  />
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between items-center mt-3 pt-3 border-t">
            <div className="flex gap-2 text-primary">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                className="hidden" 
                accept="image/*,video/*"
                multiple
              />
              <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-primary/10 rounded-full transition-colors">
                <ImageIcon size={20} />
              </button>
            </div>
            
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || (!content.trim() && selectedFiles.length === 0)}
              className="rounded-full px-5"
            >
              {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : "Post"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
