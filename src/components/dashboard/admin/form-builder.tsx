
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, doc, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2, Loader2, FileText, Hash, Type, Mail, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';

type Tournament = {
  id: string;
  name: string;
  registrationFields?: FormField[];
};

type FormField = {
  name: string;
  type: 'text' | 'number' | 'file' | 'email' | 'screenshot';
  required: boolean;
};

const FieldTypeIcon = ({ type }: { type: FormField['type'] }) => {
    switch (type) {
        case 'text': return <Type className="h-4 w-4 text-muted-foreground" />;
        case 'number': return <Hash className="h-4 w-4 text-muted-foreground" />;
        case 'file': return <FileText className="h-4 w-4 text-muted-foreground" />;
        case 'email': return <Mail className="h-4 w-4 text-muted-foreground" />;
        case 'screenshot': return <ImageIcon className="h-4 w-4 text-muted-foreground" />;
        default: return null;
    }
}

export function FormBuilder() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
  const [fields, setFields] = useState<FormField[]>([]);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState<FormField['type']>('text');
  const [newFieldRequired, setNewFieldRequired] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const tournamentsQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'tournaments')) : null),
    [firestore]
  );
  const { data: tournaments, isLoading: isLoadingTournaments } = useCollection<Tournament>(tournamentsQuery);

  const selectedTournament = useMemo(() => {
    return tournaments?.find(t => t.id === selectedTournamentId);
  }, [tournaments, selectedTournamentId]);

  useEffect(() => {
    if (selectedTournament) {
      setFields(selectedTournament.registrationFields || []);
    } else {
      setFields([]);
    }
  }, [selectedTournament]);

  const handleAddField = () => {
    if (newFieldName.trim() === '') {
      toast({ variant: 'destructive', title: 'Field name is required.' });
      return;
    }
    setFields([...fields, { name: newFieldName, type: newFieldType, required: newFieldRequired }]);
    setNewFieldName('');
    setNewFieldType('text');
    setNewFieldRequired(true);
  };

  const handleRemoveField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };
  
  const handleSaveFields = async () => {
    if (!firestore || !selectedTournamentId) return;
    setIsSaving(true);
    try {
        const tournamentRef = doc(firestore, 'tournaments', selectedTournamentId);
        await updateDoc(tournamentRef, {
            registrationFields: fields
        });
        toast({ title: 'Success!', description: 'Registration form has been updated.' });
    } catch(error: any) {
        console.error("Error saving form fields: ", error);
        toast({ variant: 'destructive', title: 'Error', description: error.message || 'Could not save form fields.' });
    } finally {
        setIsSaving(false);
    }
  }

  return (
    <Card className="glassmorphism border-border/50 bg-dashboard-card">
      <CardHeader>
        <CardTitle>Registration Form Builder</CardTitle>
        <CardDescription>Create and manage custom fields for tournament registration forms.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Select onValueChange={setSelectedTournamentId} disabled={isLoadingTournaments}>
          <SelectTrigger className="w-full md:w-[300px] bg-black text-white border-border/60">
            <SelectValue placeholder="Select a tournament" />
          </SelectTrigger>
          <SelectContent className="glassmorphism">
            {tournaments?.map(t => (
              <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedTournamentId && (
            <div className="space-y-6 pt-4 border-t border-border/50">
                
                {/* Current Fields Display */}
                <div className="space-y-3">
                    <Label>Current Form Fields</Label>
                    {fields.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No custom fields yet. Add one below!</p>
                    ) : (
                        <div className="space-y-2 rounded-lg border border-border/50 p-4">
                            {fields.map((field, index) => (
                                <div key={index} className="flex items-center justify-between p-2 rounded-md bg-black/30">
                                    <div className="flex items-center gap-3">
                                        <FieldTypeIcon type={field.type} />
                                        <span className="font-medium">{field.name}</span>
                                        {field.required && <span className="text-xs text-primary">(Required)</span>}
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveField(index)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Add New Field Form */}
                <div className="space-y-3 p-4 rounded-lg border border-dashed border-border/80">
                    <Label>Add New Field</Label>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Input 
                            placeholder="Field Name (e.g., Team Name)"
                            value={newFieldName}
                            onChange={(e) => setNewFieldName(e.target.value)}
                            className="md:col-span-2 bg-black text-white border-border/60"
                        />
                        <Select value={newFieldType} onValueChange={(v) => setNewFieldType(v as FormField['type'])}>
                            <SelectTrigger className="bg-black text-white border-border/60">
                                <SelectValue placeholder="Select field type" />
                            </SelectTrigger>
                            <SelectContent className="glassmorphism">
                                <SelectItem value="text">Text</SelectItem>
                                <SelectItem value="number">Number</SelectItem>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="file">File</SelectItem>
                                <SelectItem value="screenshot">Screenshot</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="flex items-center space-x-2">
                           <Switch id={`required-switch`} checked={newFieldRequired} onCheckedChange={setNewFieldRequired} />
                           <Label htmlFor={`required-switch`}>Required</Label>
                        </div>
                    </div>
                     <Button onClick={handleAddField} variant="outline" className="w-full">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Field to Form
                    </Button>
                </div>
                
                <div className="flex justify-end">
                    <Button onClick={handleSaveFields} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSaving ? 'Saving...' : 'Save Form Changes'}
                    </Button>
                </div>

            </div>
        )}
      </CardContent>
    </Card>
  );
}
