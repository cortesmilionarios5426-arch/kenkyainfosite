import { useState, useCallback } from 'react';
import { DomainRegistrationData } from '@/types/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Info, Loader2, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface DomainRegistrationFormProps {
  data: DomainRegistrationData;
  onChange: (data: DomainRegistrationData) => void;
}

interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export function DomainRegistrationForm({ data, onChange }: DomainRegistrationFormProps) {
  const [isLoadingCEP, setIsLoadingCEP] = useState(false);
  const [cepFound, setCepFound] = useState(false);
  const { toast } = useToast();

  const updateField = (field: keyof DomainRegistrationData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  // Format CPF as user types
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 11);
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  // Format CEP as user types
  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 8);
    return numbers.replace(/(\d{5})(\d)/, '$1-$2');
  };

  // Format phone as user types
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 9);
    if (numbers.length <= 4) return numbers;
    if (numbers.length <= 8) return numbers.replace(/(\d{4})(\d)/, '$1-$2');
    return numbers.replace(/(\d{5})(\d)/, '$1-$2');
  };

  // Fetch address from ViaCEP
  const fetchAddressByCEP = useCallback(async (cep: string) => {
    const cleanCEP = cep.replace(/\D/g, '');
    
    if (cleanCEP.length !== 8) {
      setCepFound(false);
      return;
    }

    setIsLoadingCEP(true);
    setCepFound(false);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
      const result: ViaCEPResponse = await response.json();

      if (result.erro) {
        toast({
          title: 'CEP não encontrado',
          description: 'Verifique o CEP digitado e tente novamente.',
          variant: 'destructive',
        });
        return;
      }

      // Update form with address data
      onChange({
        ...data,
        cep: formatCEP(cleanCEP),
        address: result.logradouro || data.address,
        city: result.localidade || data.city,
        state: result.uf || data.state,
        complement: result.complemento || data.complement,
      });

      setCepFound(true);
      
      toast({
        title: 'Endereço encontrado!',
        description: `${result.logradouro}, ${result.localidade} - ${result.uf}`,
      });
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      toast({
        title: 'Erro ao buscar CEP',
        description: 'Não foi possível consultar o endereço. Digite manualmente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingCEP(false);
    }
  }, [data, onChange, toast]);

  // Handle CEP change
  const handleCEPChange = (value: string) => {
    const formatted = formatCEP(value);
    updateField('cep', formatted);
    
    // Auto-fetch when CEP is complete (8 digits)
    const cleanCEP = value.replace(/\D/g, '');
    if (cleanCEP.length === 8) {
      fetchAddressByCEP(cleanCEP);
    } else {
      setCepFound(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Privacy notice */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
        <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm text-foreground font-medium mb-1">
            Seus dados estão protegidos
          </p>
          <p className="text-sm text-muted-foreground">
            Para registrar um domínio .com.br, o Registro.br exige os dados do titular. 
            Essas informações são obrigatórias para garantir a propriedade legal do domínio em seu nome. 
            Tratamos seus dados com total sigilo e segurança, seguindo a LGPD.
          </p>
        </div>
      </div>

      {/* Personal Info Section */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <Info className="w-4 h-4 text-primary" />
          Dados do Titular
        </h3>
        
        <div className="grid grid-cols-1 gap-4">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Nome completo *</Label>
            <Input
              id="fullName"
              value={data.fullName}
              onChange={(e) => updateField('fullName', e.target.value)}
              placeholder="Ex: Maria da Silva Santos"
              className="form-input-animated form-input-tall"
            />
          </div>

          {/* CPF */}
          <div className="space-y-2">
            <Label htmlFor="cpf">CPF *</Label>
            <Input
              id="cpf"
              value={data.cpf}
              onChange={(e) => updateField('cpf', formatCPF(e.target.value))}
              placeholder="Ex: 123.456.789-00"
              className="form-input-animated form-input-tall"
              maxLength={14}
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">E-mail *</Label>
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="Ex: contato@email.com.br"
              className="form-input-animated form-input-tall"
            />
          </div>
        </div>
      </div>

      {/* Address Section */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold">Endereço</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* CEP */}
          <div className="space-y-2">
            <Label htmlFor="cep">CEP *</Label>
            <div className="relative">
              <Input
                id="cep"
                value={data.cep}
                onChange={(e) => handleCEPChange(e.target.value)}
                placeholder="Ex: 01310-100"
                className={cn(
                  "form-input-animated form-input-tall pr-10",
                  cepFound && "border-green-500 focus-visible:ring-green-500"
                )}
                maxLength={9}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isLoadingCEP && (
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                )}
                {cepFound && !isLoadingCEP && (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Digite o CEP para preencher o endereço automaticamente
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {/* Address */}
          <div className="space-y-2 sm:col-span-3">
            <Label htmlFor="address">Logradouro *</Label>
            <Input
              id="address"
              value={data.address}
              onChange={(e) => updateField('address', e.target.value)}
              placeholder="Ex: Avenida Paulista"
              className="form-input-animated form-input-tall"
            />
          </div>

          {/* Number */}
          <div className="space-y-2">
            <Label htmlFor="number">Número *</Label>
            <Input
              id="number"
              value={data.number}
              onChange={(e) => updateField('number', e.target.value)}
              placeholder="Ex: 1000"
              className="form-input-animated form-input-tall"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Complement */}
          <div className="space-y-2">
            <Label htmlFor="complement">Complemento</Label>
            <Input
              id="complement"
              value={data.complement}
              onChange={(e) => updateField('complement', e.target.value)}
              placeholder="Ex: Sala 101"
              className="form-input-animated form-input-tall"
            />
          </div>

          {/* State */}
          <div className="space-y-2">
            <Label htmlFor="state">UF *</Label>
            <Input
              id="state"
              value={data.state}
              onChange={(e) => updateField('state', e.target.value.toUpperCase().slice(0, 2))}
              placeholder="Ex: SP"
              className="form-input-animated form-input-tall"
              maxLength={2}
            />
          </div>

          {/* City */}
          <div className="space-y-2">
            <Label htmlFor="city">Cidade *</Label>
            <Input
              id="city"
              value={data.city}
              onChange={(e) => updateField('city', e.target.value)}
              placeholder="Ex: São Paulo"
              className="form-input-animated form-input-tall"
            />
          </div>
        </div>
      </div>

      {/* Phone Section */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold">Telefone para Contato</h3>
        
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
          {/* DDD */}
          <div className="space-y-2">
            <Label htmlFor="ddd">DDD *</Label>
            <Input
              id="ddd"
              value={data.ddd}
              onChange={(e) => updateField('ddd', e.target.value.replace(/\D/g, '').slice(0, 2))}
              placeholder="11"
              className="form-input-animated form-input-tall"
              maxLength={2}
            />
          </div>

          {/* Phone */}
          <div className="space-y-2 col-span-2 sm:col-span-2">
            <Label htmlFor="phone">Telefone *</Label>
            <Input
              id="phone"
              value={data.phone}
              onChange={(e) => updateField('phone', formatPhone(e.target.value))}
              placeholder="99999-9999"
              className="form-input-animated form-input-tall"
              maxLength={10}
            />
          </div>

          {/* Extension */}
          <div className="space-y-2">
            <Label htmlFor="extension">Ramal</Label>
            <Input
              id="extension"
              value={data.extension}
              onChange={(e) => updateField('extension', e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="1234"
              className="form-input-animated form-input-tall"
              maxLength={4}
            />
          </div>
        </div>
      </div>
    </div>
  );
}