import { useState } from 'react';
import { SocialNetwork } from '@/types/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, Instagram, Facebook, Linkedin, Twitter, Youtube, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

const socialPlatforms = [
  { id: 'instagram', name: 'Instagram', icon: Instagram, placeholder: 'instagram.com/seu_perfil' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, placeholder: 'facebook.com/sua_pagina' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, placeholder: 'linkedin.com/in/seu_perfil' },
  { id: 'twitter', name: 'Twitter/X', icon: Twitter, placeholder: 'twitter.com/seu_perfil' },
  { id: 'youtube', name: 'YouTube', icon: Youtube, placeholder: 'youtube.com/@seu_canal' },
  { id: 'website', name: 'Website', icon: Globe, placeholder: 'www.seusite.com.br' },
];

interface SocialNetworkInputProps {
  networks: SocialNetwork[];
  onChange: (networks: SocialNetwork[]) => void;
}

export function SocialNetworkInput({ networks, onChange }: SocialNetworkInputProps) {
  const [newPlatform, setNewPlatform] = useState('');
  const [newUrl, setNewUrl] = useState('');

  const addNetwork = () => {
    if (newPlatform && newUrl) {
      onChange([...networks, { platform: newPlatform, url: newUrl }]);
      setNewPlatform('');
      setNewUrl('');
    }
  };

  const removeNetwork = (index: number) => {
    onChange(networks.filter((_, i) => i !== index));
  };

  const getIcon = (platform: string) => {
    const found = socialPlatforms.find((p) => p.id === platform);
    return found?.icon || Globe;
  };

  const getPlaceholder = (platform: string) => {
    const found = socialPlatforms.find((p) => p.id === platform);
    return found?.placeholder || 'URL da rede social';
  };

  return (
    <div className="space-y-4">
      {/* Existing networks */}
      {networks.length > 0 && (
        <div className="space-y-2">
          {networks.map((network, index) => {
            const Icon = getIcon(network.platform);
            const platformName = socialPlatforms.find((p) => p.id === network.platform)?.name || network.platform;
            
            return (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 animate-scale-in"
              >
                <Icon className="w-5 h-5 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{platformName}</p>
                  <p className="text-xs text-muted-foreground truncate">{network.url}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeNetwork(index)}
                  className="p-1.5 rounded-full hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add new network */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={newPlatform} onValueChange={setNewPlatform}>
          <SelectTrigger className="w-full sm:w-[180px] form-input-animated">
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent>
            {socialPlatforms.map((platform) => {
              const Icon = platform.icon;
              return (
                <SelectItem key={platform.id} value={platform.id}>
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {platform.name}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        <Input
          type="url"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          placeholder={newPlatform ? getPlaceholder(newPlatform) : 'Selecione uma rede primeiro'}
          className="flex-1 form-input-animated"
          disabled={!newPlatform}
        />

        <Button
          type="button"
          onClick={addNetwork}
          disabled={!newPlatform || !newUrl}
          variant="secondary"
          className={cn(
            'shrink-0 transition-all duration-300',
            newPlatform && newUrl && 'bg-primary text-primary-foreground hover:bg-primary/90'
          )}
        >
          <Plus className="w-4 h-4 mr-1" />
          Adicionar
        </Button>
      </div>
    </div>
  );
}
