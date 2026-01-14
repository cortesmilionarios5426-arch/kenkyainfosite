import { useState } from 'react';
import { SocialNetwork } from '@/types/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, Instagram, Facebook, Linkedin, Twitter, Youtube, Globe, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const socialPlatforms = [
  { 
    id: 'instagram', 
    name: 'Instagram', 
    icon: Instagram, 
    placeholder: '@seuperfil ou instagram.com/seuperfil',
    tooltip: 'Abra o Instagram, vá no seu perfil, toque em "Editar perfil" e copie o link. Ou simplesmente digite seu @usuario.'
  },
  { 
    id: 'facebook', 
    name: 'Facebook', 
    icon: Facebook, 
    placeholder: 'facebook.com/suapagina',
    tooltip: 'Abra sua página no Facebook, clique nos 3 pontos → "Copiar link". O link será algo como facebook.com/suapagina'
  },
  { 
    id: 'linkedin', 
    name: 'LinkedIn', 
    icon: Linkedin, 
    placeholder: 'linkedin.com/in/seuperfil',
    tooltip: 'Abra o LinkedIn, vá no seu perfil e copie o link da barra de endereço. Ex: linkedin.com/in/seunome'
  },
  { 
    id: 'twitter', 
    name: 'Twitter/X', 
    icon: Twitter, 
    placeholder: '@seuperfil ou x.com/seuperfil',
    tooltip: 'Vá no seu perfil do X/Twitter e copie o link, ou simplesmente digite seu @usuario.'
  },
  { 
    id: 'youtube', 
    name: 'YouTube', 
    icon: Youtube, 
    placeholder: 'youtube.com/@seucanal',
    tooltip: 'Abra seu canal no YouTube, clique no seu nome/foto e copie o link. Ex: youtube.com/@seucanal'
  },
  { 
    id: 'tiktok', 
    name: 'TikTok', 
    icon: Globe, 
    placeholder: '@seuperfil ou tiktok.com/@seuperfil',
    tooltip: 'Abra o TikTok, vá no seu perfil, toque em "..." e "Copiar link". Ou digite seu @usuario.'
  },
  { 
    id: 'website', 
    name: 'Website', 
    icon: Globe, 
    placeholder: 'www.seusite.com.br',
    tooltip: 'Digite o endereço completo do seu site. Ex: www.seusite.com.br'
  },
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

  const getTooltip = (platform: string) => {
    const found = socialPlatforms.find((p) => p.id === platform);
    return found?.tooltip || '';
  };

  const selectedPlatform = socialPlatforms.find((p) => p.id === newPlatform);

  return (
    <TooltipProvider>
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
        <div className="space-y-3">
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

            <div className="flex-1 relative">
              <Input
                type="text"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder={newPlatform ? getPlaceholder(newPlatform) : 'Selecione uma rede primeiro'}
                className="form-input-animated pr-10"
                disabled={!newPlatform}
              />
              {newPlatform && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <HelpCircle className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[280px] text-sm">
                    <p>{getTooltip(newPlatform)}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>

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
      </div>
    </TooltipProvider>
  );
}
