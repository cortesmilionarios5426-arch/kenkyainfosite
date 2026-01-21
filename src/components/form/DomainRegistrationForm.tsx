import { DomainRegistrationData } from '@/types/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Info } from 'lucide-react';

interface DomainRegistrationFormProps {
  data: DomainRegistrationData;
  onChange: (data: DomainRegistrationData) => void;
}

export function DomainRegistrationForm({ data, onChange }: DomainRegistrationFormProps) {
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

  return (
    <div className="space-y-6">
      {/* Privacy notice */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
        <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm text-foreground font-medium mb-1">
            Por que precisamos desses dados?
          </p>
          <p className="text-sm text-muted-foreground">
            Para registrar um domínio .com.br, é necessário informar os dados do titular. 
            Essas informações garantem que o domínio seja de sua propriedade legal, 
            assegurando seus direitos sobre ele. Seus dados são tratados com total sigilo e segurança.
          </p>
        </div>
      </div>

      {/* Personal Info Section */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <Info className="w-4 h-4 text-primary" />
          Dados Pessoais do Titular
        </h3>
        
        <div className="grid grid-cols-1 gap-4">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Nome completo (pessoa física) *</Label>
            <Input
              id="fullName"
              value={data.fullName}
              onChange={(e) => updateField('fullName', e.target.value)}
              placeholder="EXEMPLO: João da Silva Santos"
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
              placeholder="EXEMPLO: 123.456.789-00"
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
              placeholder="EXEMPLO: contato@email.com"
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
            <Input
              id="cep"
              value={data.cep}
              onChange={(e) => updateField('cep', formatCEP(e.target.value))}
              placeholder="00000-000"
              className="form-input-animated form-input-tall"
              maxLength={9}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {/* Address */}
          <div className="space-y-2 sm:col-span-3">
            <Label htmlFor="address">Endereço *</Label>
            <Input
              id="address"
              value={data.address}
              onChange={(e) => updateField('address', e.target.value)}
              placeholder="EXEMPLO: Rua das Flores"
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
              placeholder="123"
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
              placeholder="Apto 101"
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
              placeholder="SP"
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
              placeholder="São Paulo"
              className="form-input-animated form-input-tall"
            />
          </div>
        </div>
      </div>

      {/* Phone Section */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold">Telefone</h3>
        
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