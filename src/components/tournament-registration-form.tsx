'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from '@/hooks/use-toast';
import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { DialogClose } from '@/components/ui/dialog';
import { Skeleton } from './ui/skeleton';
import { Label } from '@/components/ui/label';

type FormFieldConfig = {
  name: string;
  type: 'text' | 'number' | 'file' | 'email' | 'screenshot';
  required: boolean;
};

type Tournament = {
  id: string;
  name: string;
  registrationFields?: FormFieldConfig[];
};

// Generates a Zod schema from the dynamic form fields
const generateFormSchema = (fields: FormFieldConfig[] = []) => {
  const customFieldsSchema: { [key: string]: z.ZodTypeAny } = {};

  fields.forEach(field => {
    let fieldSchema: z.ZodTypeAny;

    switch (field.type) {
      case 'text':
        fieldSchema = z.string();
        if (field.required) {
          fieldSchema = fieldSchema.min(1, `${field.name} is required.`);
        } else {
          fieldSchema = fieldSchema.optional();
        }
        break;
      case 'number':
        fieldSchema = z.coerce.number();
        if (!field.required) {
          fieldSchema = fieldSchema.optional();
        }
        break;
      case 'email':
        fieldSchema = z.string().email({ message: "Invalid email address." });
        if (!field.required) {
          // Allow optional or empty string for non-required email
          fieldSchema = fieldSchema.optional().or(z.literal(''));
        }
        break;
      case 'file':
      case 'screenshot':
        fieldSchema = z.any(); // `any` for FileList
        if (field.required) {
          fieldSchema = fieldSchema.refine((files) => files?.length > 0, `${field.name} is required.`);
        } else {
            fieldSchema = fieldSchema.optional();
        }
        break;
      default:
        fieldSchema = z.any().optional();
    }
    customFieldsSchema[field.name] = fieldSchema;
  });

  return z.object({
      customData: z.object(customFieldsSchema)
  });
};


export function TournamentRegistrationForm({ tournamentId }: { tournamentId: string }) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const tournamentDocRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'tournaments', tournamentId) : null),
    [firestore, tournamentId]
  );
  const { data: tournament, isLoading: isLoadingTournament } = useDoc<Tournament>(tournamentDocRef);

  const formSchema = React.useMemo(() => generateFormSchema(tournament?.registrationFields), [tournament]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customData: {},
    },
  });
  
  React.useEffect(() => {
    if (user?.email) {
        const emailField = tournament?.registrationFields?.find(f => f.type === 'email');
        if (emailField) {
            form.setValue(`customData.${emailField.name}`, user.email);
        }
    }
  }, [user, form, tournament]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
        toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to register.' });
        return;
    }

    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append('tournamentId', tournamentId);
    formData.append('userId', user.uid);
    
    const registrationFields = tournament?.registrationFields || [];
    formData.append('registrationFields', JSON.stringify(registrationFields));
    
    // Separate files from other data and append to FormData
    const customDataPayload: Record<string, any> = {};
    for (const key in values.customData) {
        const fieldConfig = registrationFields.find(f => f.name === key);
        const value = values.customData[key as keyof typeof values.customData];

        if (fieldConfig && (fieldConfig.type === 'file' || fieldConfig.type === 'screenshot') && value instanceof FileList && value.length > 0) {
            formData.append(key, value[0]);
        } else {
            customDataPayload[key] = value;
        }
    }

    formData.append('customData', JSON.stringify(customDataPayload));

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to register.');
      }
      
      toast({
        title: "Registration Successful!",
        description: `You have successfully registered for the tournament.`,
      });
      
      form.reset();
      // This is a bit of a hack to programmatically close the dialog.
      // A better way would be to lift state up, but this works for now.
      document.querySelector('[data-radix-dialog-close]')?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));


    } catch (error: any) {
      console.error("Error registering for tournament:", error);
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message || "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
   if (isLoadingTournament) {
    return (
        <div className="space-y-6 py-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <div className="flex justify-end pt-4">
                <Skeleton className="h-10 w-24" />
            </div>
        </div>
    );
   }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        <div>
            <Label htmlFor="username">Username</Label>
            <Input id="username" value={user?.displayName || ''} readOnly disabled className="mt-2 bg-black text-white border-border/60" />
        </div>
        
        {tournament?.registrationFields?.map(fieldConfig => {
            const isEmailField = fieldConfig.type === 'email';

            return (
                 <FormField
                    key={fieldConfig.name}
                    control={form.control}
                    name={`customData.${fieldConfig.name}` as any}
                    render={({ field }) => {
                        const isFile = fieldConfig.type === 'file' || fieldConfig.type === 'screenshot';
                        
                        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                          if (isFile && e.target.files) {
                            field.onChange(e.target.files);
                          } else {
                            field.onChange(e.target.value);
                          }
                        };
                        
                        // Omit value for file inputs to let the browser control it
                        const { value, ...restOfField } = field;
                        const inputProps = isFile ? { ...restOfField, onChange: handleChange } : { ...field };


                        return (
                            <FormItem>
                            <FormLabel>{fieldConfig.name}{fieldConfig.required && <span className="text-destructive">*</span>}</FormLabel>
                            <FormControl>
                                <Input 
                                    type={isFile ? 'file' : fieldConfig.type}
                                    {...inputProps}
                                    disabled={isSubmitting || (isEmailField && !!user?.email)} // Disable email if user is logged in
                                    className="bg-black text-white border-border/60 file:text-foreground/80"
                                />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )
                    }}
                />
            )
        })}
        
        <div className="flex justify-end gap-2 pt-4">
            <DialogClose asChild>
                <Button type="button" variant="ghost" disabled={isSubmitting}>Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Registering...' : 'Submit Registration'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
