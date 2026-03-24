import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';

interface Client {
  id: string;
  name: string;
}

const sampleExtractions = [
  { asset_name: 'CDB XP 120% CDI', institution: 'XP Investimentos', amount: 100000, quantity: 100000, asset_type: 'CDB' },
  { asset_name: 'XP Multi Strategy Fund', institution: 'BTG Pactual', amount: 50000, quantity: 5000, asset_type: 'Fund' },
  { asset_name: 'TSLA', institution: 'Interactive Brokers', amount: 20000, quantity: 80, asset_type: 'Stock' },
  { asset_name: 'AAPL', institution: 'Interactive Brokers', amount: 15000, quantity: 100, asset_type: 'Stock' },
  { asset_name: 'BOVA11', institution: 'XP Investimentos', amount: 30000, quantity: 300, asset_type: 'ETF' },
];

export function UploadStatement() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    const { data } = await supabase
      .from('clients')
      .select('id, name')
      .order('name');

    if (data) {
      setClients(data);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedClient || !file) return;

    setUploading(true);
    try {
      const documentId = crypto.randomUUID();
      const fileUrl = `statements/${selectedClient}/${file.name}`;

      const { error: docError } = await supabase
        .from('documents')
        .insert([{
          id: documentId,
          client_id: selectedClient,
          file_url: fileUrl,
        }]);

      if (docError) throw docError;

      const extractedPositions = sampleExtractions.map(pos => ({
        document_id: documentId,
        ...pos,
      }));

      const { error: extractError } = await supabase
        .from('extracted_positions')
        .insert(extractedPositions);

      if (extractError) throw extractError;

      setUploadSuccess(true);
      setTimeout(() => {
        navigate('/review');
      }, 2000);
    } catch (error) {
      console.error('Error uploading statement:', error);
    } finally {
      setUploading(false);
    }
  };

  const clientOptions = [
    { value: '', label: 'Select a client' },
    ...clients.map(c => ({ value: c.id, label: c.name })),
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Upload Statement</h1>
        <p className="mt-1 text-sm text-gray-600">
          Upload PDF statements to automatically extract investment positions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Statement Upload</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Select
            label="Select Client"
            options={clientOptions}
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PDF Statement
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
              {file ? (
                <div className="space-y-4">
                  <FileText className="h-12 w-12 text-blue-600 mx-auto" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFile(null)}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                  <p className="mt-2 text-sm font-medium text-gray-900">
                    Click to upload or drag and drop
                  </p>
                  <p className="mt-1 text-xs text-gray-500">PDF files only</p>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf"
                    onChange={handleFileChange}
                  />
                </label>
              )}
            </div>
          </div>

          {uploadSuccess ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-900">Upload successful!</p>
                <p className="text-xs text-green-700 mt-1">Redirecting to review page...</p>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Demo Mode:</strong> This will simulate extracting investment positions from the PDF.
                Sample positions will be generated for review.
              </p>
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={!selectedClient || !file || uploading || uploadSuccess}
            className="w-full"
          >
            {uploading ? 'Processing...' : 'Upload & Extract Positions'}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-gray-50">
        <CardContent className="space-y-3">
          <h3 className="font-semibold text-gray-900">How it works</h3>
          <ol className="space-y-2 text-sm text-gray-600">
            <li className="flex gap-2">
              <span className="font-semibold text-blue-600">1.</span>
              Select the client who owns the statement
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-blue-600">2.</span>
              Upload the PDF statement from their financial institution
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-blue-600">3.</span>
              AI automatically extracts investment positions
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-blue-600">4.</span>
              Review and confirm the extracted data
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-blue-600">5.</span>
              Positions are added to the client portfolio
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
