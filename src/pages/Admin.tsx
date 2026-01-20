import { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { LogIn, LogOut, Trash2, Eye, RefreshCw, Users, FileText, Copy, Download, Image } from 'lucide-react';
import { planInfo } from '@/types/form';
import { cn } from '@/lib/utils';
import { BrandingPdfGenerator } from '@/components/admin/BrandingPdfGenerator';

interface FormResponse {
  id: string;
  business_name: string;
  main_service: string;
  business_colors: string;
  whatsapp_number: string;
  social_networks: any;
  logo_url: string | null;
  chosen_plan: 'presenca' | 'conversao' | 'autoridade';
  professional_summary: string | null;
  services: string | null;
  location_hours: string | null;
  main_objective: string | null;
  pain_solutions: string | null;
  competitive_differentials: string | null;
  testimonials_section: string | null;
  visual_process: string | null;
  faq: string | null;
  results_gallery: string | null;
  premium_visual_style: string | null;
  advanced_footer_map: string | null;
  status: string;
  created_at: string;
}

export default function Admin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isCheckingRole, setIsCheckingRole] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Listener precisa ser síncrono (evita travamentos / deadlocks)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setIsCheckingRole(false);
      setIsAdmin(false);
      setResponses([]);
      return;
    }

    setIsCheckingRole(true);

    let cancelled = false;
    setTimeout(() => {
      (async () => {
        const { data: roles, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin');

        if (cancelled) return;

        if (error) {
          setIsAdmin(false);
          toast({
            title: 'Erro ao verificar permissão',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          const ok = !!roles && roles.length > 0;
          setIsAdmin(ok);
          if (ok) fetchResponses();
        }

        setIsCheckingRole(false);
      })();
    }, 0);

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const fetchResponses = async () => {
    setIsLoadingData(true);
    try {
      const { data, error } = await supabase
        .from('form_responses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResponses(data || []);
    } catch (error) {
      console.error('Error fetching responses:', error);
      toast({
        title: 'Erro ao carregar respostas',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: 'Login realizado!',
      });
    } catch (error: any) {
      toast({
        title: 'Erro no login',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signOut();
    setIsLoading(false);

    if (error) {
      toast({
        title: 'Erro ao sair',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    toast({ title: 'Você saiu da conta' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta resposta?')) return;

    try {
      const { error } = await supabase
        .from('form_responses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setResponses((prev) => prev.filter((r) => r.id !== id));
      toast({ title: 'Resposta excluída' });
    } catch (error) {
      toast({
        title: 'Erro ao excluir',
        variant: 'destructive',
      });
    }
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'presenca':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'conversao':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'autoridade':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default:
        return '';
    }
  };

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md glass-card border-border">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl gradient-text">Painel Admin</CardTitle>
            <CardDescription>Faça login para gerenciar as respostas</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input-animated"
                  required
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input-animated"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-accent"
                disabled={isLoading}
              >
                {isLoading ? 'Entrando...' : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Entrar
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Logged in: checking permissions
  if (isCheckingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md glass-card border-border text-center">
          <CardHeader>
            <CardTitle className="text-2xl gradient-text">Verificando acesso…</CardTitle>
            <CardDescription>
              {user?.email ? `Logado como ${user.email}` : 'Carregando sua sessão'}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Logged in but not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md glass-card border-border text-center">
          <CardHeader>
            <CardTitle className="text-2xl text-destructive">Acesso Negado</CardTitle>
            <CardDescription>
              {user?.email
                ? `Você está logado como ${user.email}, mas este usuário não é admin.`
                : 'Você não tem permissão para acessar este painel.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button
              type="button"
              onClick={handleLogout}
              variant="destructive"
              className="cursor-pointer"
              disabled={isLoading}
            >
              <LogOut className="w-4 h-4 mr-2" />
              {isLoading ? 'Saindo…' : 'Sair e fazer login novamente'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin dashboard
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Painel Admin</h1>
            <p className="text-muted-foreground">Gerencie as respostas do formulário</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={fetchResponses} variant="outline" disabled={isLoadingData}>
              <RefreshCw className={cn('w-4 h-4 mr-2', isLoadingData && 'animate-spin')} />
              Atualizar
            </Button>
            <Button onClick={handleLogout} variant="ghost">
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="glass-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/20">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total de Respostas</p>
                  <p className="text-2xl font-bold">{responses.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-purple-500/20">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Plano Conversão</p>
                  <p className="text-2xl font-bold">
                    {responses.filter((r) => r.chosen_plan === 'conversao').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-amber-500/20">
                  <Users className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Plano Autoridade</p>
                  <p className="text-2xl font-bold">
                    {responses.filter((r) => r.chosen_plan === 'autoridade').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Responses Table */}
        <Card className="glass-card border-border">
          <CardHeader>
            <CardTitle>Respostas Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {responses.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma resposta ainda</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Negócio</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Serviço</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Plano</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Data</th>
                      <th className="text-right p-3 text-sm font-medium text-muted-foreground">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {responses.map((response) => (
                      <tr key={response.id} className="border-b border-border/50 hover:bg-muted/20">
                        <td className="p-3 font-medium">{response.business_name}</td>
                        <td className="p-3 text-muted-foreground">{response.main_service}</td>
                        <td className="p-3">
                          <Badge className={cn('border', getPlanBadgeColor(response.chosen_plan))}>
                            {planInfo[response.chosen_plan]?.name || response.chosen_plan}
                          </Badge>
                        </td>
                        <td className="p-3 text-muted-foreground text-sm">
                          {new Date(response.created_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSelectedResponse(response)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDelete(response.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detail Modal */}
        <Dialog open={!!selectedResponse} onOpenChange={() => setSelectedResponse(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass-card border-border">
            <DialogHeader>
              <DialogTitle className="gradient-text">{selectedResponse?.business_name}</DialogTitle>
              <DialogDescription>{selectedResponse?.main_service}</DialogDescription>
            </DialogHeader>
            
            {selectedResponse && (
              <>
                {/* Action buttons */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const text = formatResponseForCopy(selectedResponse);
                      navigator.clipboard.writeText(text);
                      toast({ title: 'Copiado para a área de transferência!' });
                    }}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar tudo
                  </Button>
                  
                  <BrandingPdfGenerator
                    businessName={selectedResponse.business_name}
                    businessColors={selectedResponse.business_colors}
                    logoUrl={selectedResponse.logo_url}
                  />
                  
                  {getGalleryPhotos(selectedResponse.results_gallery).length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadAllPhotos(selectedResponse)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Baixar fotos ({getGalleryPhotos(selectedResponse.results_gallery).length})
                    </Button>
                  )}
                </div>

                <Tabs defaultValue="basic" className="mt-2">
                  <TabsList className="grid grid-cols-4 w-full">
                    <TabsTrigger value="basic">Básico</TabsTrigger>
                    <TabsTrigger value="content">Conteúdo</TabsTrigger>
                    <TabsTrigger value="advanced">Avançado</TabsTrigger>
                    <TabsTrigger value="gallery">Galeria</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basic" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">WhatsApp</p>
                        <p className="font-medium">{selectedResponse.whatsapp_number}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Cores</p>
                        <div className="flex gap-2 mt-1">
                          {selectedResponse.business_colors.split(',').map((color, i) => (
                            <div
                              key={i}
                              className="w-6 h-6 rounded-lg border border-border"
                              style={{ backgroundColor: color.trim() }}
                              title={color.trim()}
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Plano</p>
                        <Badge className={cn('border mt-1', getPlanBadgeColor(selectedResponse.chosen_plan))}>
                          {planInfo[selectedResponse.chosen_plan]?.name}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Redes Sociais</p>
                        {Array.isArray(selectedResponse.social_networks) && selectedResponse.social_networks.length > 0 ? (
                          <div className="space-y-1 mt-1">
                            {selectedResponse.social_networks.map((net: any, i: number) => (
                              <a key={i} href={net.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline block">
                                {net.platform}: {net.url}
                              </a>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Nenhuma</p>
                        )}
                      </div>
                      {selectedResponse.logo_url && (
                        <div className="col-span-2">
                          <p className="text-sm text-muted-foreground mb-2">Logo</p>
                          <img src={selectedResponse.logo_url} alt="Logo" className="w-24 h-24 object-contain rounded-lg border border-border" />
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="content" className="space-y-4 mt-4">
                    {selectedResponse.professional_summary && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Resumo Profissional</p>
                        <pre className="text-sm bg-muted/30 p-3 rounded-lg whitespace-pre-wrap font-sans">{selectedResponse.professional_summary}</pre>
                      </div>
                    )}
                    {selectedResponse.services && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Serviços</p>
                        <pre className="text-sm bg-muted/30 p-3 rounded-lg whitespace-pre-wrap font-sans">{selectedResponse.services}</pre>
                      </div>
                    )}
                    {selectedResponse.location_hours && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Local e Horário</p>
                        <pre className="text-sm bg-muted/30 p-3 rounded-lg whitespace-pre-wrap font-sans">{selectedResponse.location_hours}</pre>
                      </div>
                    )}
                    {selectedResponse.main_objective && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Objetivo Principal</p>
                        <pre className="text-sm bg-muted/30 p-3 rounded-lg whitespace-pre-wrap font-sans">{selectedResponse.main_objective}</pre>
                      </div>
                    )}
                    {selectedResponse.testimonials_section && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Depoimentos</p>
                        <pre className="text-sm bg-muted/30 p-3 rounded-lg whitespace-pre-wrap font-sans">{formatTestimonials(selectedResponse.testimonials_section)}</pre>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="advanced" className="space-y-4 mt-4">
                    {selectedResponse.pain_solutions && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Dores & Soluções</p>
                        <pre className="text-sm bg-muted/30 p-3 rounded-lg whitespace-pre-wrap font-sans">{selectedResponse.pain_solutions}</pre>
                      </div>
                    )}
                    {selectedResponse.competitive_differentials && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Diferenciais</p>
                        <pre className="text-sm bg-muted/30 p-3 rounded-lg whitespace-pre-wrap font-sans">{selectedResponse.competitive_differentials}</pre>
                      </div>
                    )}
                    {selectedResponse.visual_process && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Processo de Atendimento</p>
                        <pre className="text-sm bg-muted/30 p-3 rounded-lg whitespace-pre-wrap font-sans">{selectedResponse.visual_process}</pre>
                      </div>
                    )}
                    {selectedResponse.faq && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">FAQ</p>
                        <pre className="text-sm bg-muted/30 p-3 rounded-lg whitespace-pre-wrap font-sans">{selectedResponse.faq}</pre>
                      </div>
                    )}
                    {selectedResponse.premium_visual_style && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Estilo Visual</p>
                        <pre className="text-sm bg-muted/30 p-3 rounded-lg whitespace-pre-wrap font-sans">{selectedResponse.premium_visual_style}</pre>
                      </div>
                    )}
                    {selectedResponse.advanced_footer_map && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Endereço</p>
                        <pre className="text-sm bg-muted/30 p-3 rounded-lg whitespace-pre-wrap font-sans">{selectedResponse.advanced_footer_map}</pre>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="gallery" className="mt-4">
                    {(() => {
                      const photos = getGalleryPhotos(selectedResponse.results_gallery);
                      if (photos.length === 0) {
                        return (
                          <div className="text-center py-12 text-muted-foreground">
                            <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>Nenhuma foto enviada</p>
                          </div>
                        );
                      }
                      return (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {photos.map((url, index) => (
                            <a
                              key={index}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="aspect-square rounded-xl overflow-hidden border-2 border-border hover:border-primary transition-colors"
                            >
                              <img src={url} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                            </a>
                          ))}
                        </div>
                      );
                    })()}
                  </TabsContent>
                </Tabs>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );

  // Helper functions
  function formatResponseForCopy(response: FormResponse): string {
    const sections: string[] = [];
    
    sections.push(`=== ${response.business_name.toUpperCase()} ===`);
    sections.push(`Serviço: ${response.main_service}`);
    sections.push(`Plano: ${planInfo[response.chosen_plan]?.name}`);
    sections.push(`WhatsApp: ${response.whatsapp_number}`);
    sections.push(`Cores: ${response.business_colors}`);
    
    if (response.logo_url) {
      sections.push(`\nLogo: ${response.logo_url}`);
    }
    
    if (Array.isArray(response.social_networks) && response.social_networks.length > 0) {
      sections.push(`\n--- REDES SOCIAIS ---`);
      response.social_networks.forEach((net: any) => {
        sections.push(`${net.platform}: ${net.url}`);
      });
    }
    
    if (response.professional_summary) {
      sections.push(`\n--- RESUMO PROFISSIONAL ---\n${response.professional_summary}`);
    }
    
    if (response.services) {
      sections.push(`\n--- SERVIÇOS ---\n${response.services}`);
    }
    
    if (response.location_hours) {
      sections.push(`\n--- LOCAL E HORÁRIO ---\n${response.location_hours}`);
    }
    
    if (response.main_objective) {
      sections.push(`\n--- OBJETIVO ---\n${response.main_objective}`);
    }
    
    if (response.pain_solutions) {
      sections.push(`\n--- DORES & SOLUÇÕES ---\n${response.pain_solutions}`);
    }
    
    if (response.competitive_differentials) {
      sections.push(`\n--- DIFERENCIAIS ---\n${response.competitive_differentials}`);
    }
    
    if (response.testimonials_section) {
      sections.push(`\n--- DEPOIMENTOS ---\n${formatTestimonials(response.testimonials_section)}`);
    }
    
    if (response.visual_process) {
      sections.push(`\n--- PROCESSO DE ATENDIMENTO ---\n${response.visual_process}`);
    }
    
    if (response.faq) {
      sections.push(`\n--- FAQ ---\n${response.faq}`);
    }
    
    if (response.premium_visual_style) {
      sections.push(`\n--- ESTILO VISUAL ---\n${response.premium_visual_style}`);
    }
    
    if (response.advanced_footer_map) {
      sections.push(`\n--- ENDEREÇO ---\n${response.advanced_footer_map}`);
    }
    
    const photos = getGalleryPhotos(response.results_gallery);
    if (photos.length > 0) {
      sections.push(`\n--- GALERIA (${photos.length} fotos) ---`);
      photos.forEach((url, i) => {
        sections.push(`Foto ${i + 1}: ${url}`);
      });
    }
    
    return sections.join('\n');
  }

  function formatTestimonials(json: string): string {
    try {
      const testimonials = JSON.parse(json);
      if (!Array.isArray(testimonials)) return json;
      return testimonials.map((t: any) => `"${t.text}" - ${t.name}`).join('\n\n');
    } catch {
      return json;
    }
  }

  function getGalleryPhotos(gallery: string | null): string[] {
    if (!gallery) return [];
    try {
      const parsed = JSON.parse(gallery);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  async function downloadAllPhotos(response: FormResponse) {
    const photos = getGalleryPhotos(response.results_gallery);
    if (photos.length === 0) return;

    toast({ title: 'Iniciando downloads...' });

    for (let i = 0; i < photos.length; i++) {
      const url = photos[i];
      try {
        const res = await fetch(url);
        const blob = await res.blob();
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${response.business_name.replace(/\s+/g, '_')}_foto_${i + 1}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.error('Download error:', error);
      }
    }
    
    toast({ title: `${photos.length} fotos baixadas!` });
  }
}
