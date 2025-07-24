import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CloudUpload, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FlowAnalysis } from "@shared/schema";

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalysisUploaded: (analysis: FlowAnalysis) => void;
}

export function FileUploadModal({
  isOpen,
  onClose,
  onAnalysisUploaded,
}: FileUploadModalProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisName, setAnalysisName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiRequest("POST", "/api/flow-analyses/upload", undefined);
      return response;
    },
    onSuccess: async (response) => {
      const analysis = await response.json();
      await queryClient.invalidateQueries({ queryKey: ["/api/flow-analyses"] });
      onAnalysisUploaded(analysis);
      toast({
        title: "Sucesso",
        description: "Fluxo analisado com sucesso!",
      });
      handleReset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao processar o arquivo",
        variant: "destructive",
      });
    },
  });

  const handleReset = () => {
    setSelectedFile(null);
    setAnalysisName("");
    setIsDragOver(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const jsonFile = files.find(file => file.type === "application/json" || file.name.endsWith(".json"));
    
    if (jsonFile) {
      setSelectedFile(jsonFile);
      if (!analysisName) {
        setAnalysisName(jsonFile.name.replace(".json", ""));
      }
    } else {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione um arquivo JSON válido.",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!analysisName) {
        setAnalysisName(file.name.replace(".json", ""));
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Erro",
        description: "Selecione um arquivo para upload.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("flowFile", selectedFile);
    formData.append("name", analysisName || selectedFile.name);

    try {
      const response = await fetch("/api/flow-analyses/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Falha no upload");
      }

      const analysis = await response.json();
      await queryClient.invalidateQueries({ queryKey: ["/api/flow-analyses"] });
      onAnalysisUploaded(analysis);
      toast({
        title: "Sucesso",
        description: "Fluxo analisado com sucesso!",
      });
      handleReset();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Falha ao processar o arquivo",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <CloudUpload className="mr-2 h-5 w-5 text-primary" />
            Carregar Arquivo de Fluxo
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">
            Selecione um arquivo JSON contendo a estrutura do fluxo para análise
          </p>
          
          <div className="space-y-2">
            <Label htmlFor="analysis-name">Nome da Análise</Label>
            <Input
              id="analysis-name"
              value={analysisName}
              onChange={(e) => setAnalysisName(e.target.value)}
              placeholder="Digite um nome para esta análise"
            />
          </div>
          
          <div
            className={cn(
              "upload-dropzone",
              isDragOver && "dragover"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            {selectedFile ? (
              <div>
                <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  className="mt-2"
                >
                  <X className="h-4 w-4 mr-1" />
                  Remover
                </Button>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600">
                  Arraste e solte ou clique para selecionar
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Apenas arquivos JSON são aceitos
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
          
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleClose}
            >
              Cancelar
            </Button>
            <Button 
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={handleUpload}
              disabled={!selectedFile || uploadMutation.isPending}
            >
              {uploadMutation.isPending ? "Analisando..." : "Analisar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
