'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useCreateSupplier, useUpdateSupplier } from '@/hooks/useSuppliers';
import { Supplier } from '@/types';

const schema = z.object({
  name:     z.string().min(2, 'Nome obrigatório'),
  cnpj:     z.string().optional(),
  email:    z.string().email('E-mail inválido').optional().or(z.literal('')),
  website:  z.string().optional(),
  phone:    z.string().optional(),
  address:  z.string().optional(),
  city:     z.string().optional(),
  state:    z.string().optional(),
  zipCode:  z.string().optional(),
  notes:    z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  supplier: Supplier | null;
  onClose: () => void;
}

export function SupplierFormDialog({ open, supplier, onClose }: Props) {
  const create = useCreateSupplier();
  const update = useUpdateSupplier();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '', cnpj: '', email: '', website: '',
      phone: '', address: '', city: '', state: '',
      zipCode: '', notes: '',
    },
  });

  useEffect(() => {
    if (supplier) {
      form.reset({
        name:    supplier.name    ?? '',
        cnpj:    supplier.cnpj    ?? '',
        email:   supplier.email   ?? '',
        website: supplier.website ?? '',
        phone:   supplier.phone   ?? '',
        address: supplier.address ?? '',
        city:    supplier.city    ?? '',
        state:   supplier.state   ?? '',
        zipCode: supplier.zipCode ?? '',
        notes:   supplier.notes   ?? '',
      });
    } else {
      form.reset({
        name: '', cnpj: '', email: '', website: '',
        phone: '', address: '', city: '', state: '',
        zipCode: '', notes: '',
      });
    }
  }, [supplier, form]);

  const onSubmit = async (data: FormData) => {
    const clean = Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, v === '' ? null : v])
    );
    if (supplier) {
      await update.mutateAsync({ id: supplier.id, data: clean });
    } else {
      await create.mutateAsync(clean);
    }
    onClose();
  };

  const loading = create.isPending || update.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {supplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Nome *</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do fornecedor" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="cnpj" render={({ field }) => (
                <FormItem>
                  <FormLabel>CNPJ</FormLabel>
                  <FormControl>
                    <Input placeholder="00.000.000/0001-00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input placeholder="(11) 99999-9999" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input placeholder="contato@empresa.com.br" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="website" render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input placeholder="www.empresa.com.br" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="address" render={({ field }) => (
              <FormItem>
                <FormLabel>Endereço</FormLabel>
                <FormControl>
                  <Input placeholder="Rua, número, complemento" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <FormField control={form.control} name="city" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input placeholder="São Paulo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="state" render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <FormControl>
                    <Input placeholder="SP" maxLength={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="zipCode" render={({ field }) => (
              <FormItem>
                <FormLabel>CEP</FormLabel>
                <FormControl>
                  <Input placeholder="00000-000" className="w-40" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem>
                <FormLabel>Observações</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Informações adicionais sobre o fornecedor..."
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : supplier ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}