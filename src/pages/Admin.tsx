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
import { LogIn, LogOut, Trash2, Eye, RefreshCw, Users, FileText, Copy, Download, Image, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { planInfo } from '@/types/form';
import { cn } from '@/lib/utils';
import { BrandingPdfGenerator } from '@/components/admin/BrandingPdfGenerator';

interface FormResponse {
  id: string;
  business_type: string;
  business_name: string;
  main_service: string;
  business_colors: string;
  whatsapp_number: string;
  social_networks: any;
  logo_url: string | null;
  chosen_plan: 'presenca' | 'conversao' | 'autoridade';
  hosting_option: string | null;
  domain_registration: any | null;
  professional_summary: string | null;
  services: string | null;
  location_hours: string | null;
  main_objective: string | null;
  pain_solutions: string | null;
  competitive_differentials: string | null;
  testimonials_section: string | null;
  visual_process: string | null;
  conversion_gallery: string | null;
  faq: string | null;
  results_gallery: string | null;
  premium_visual_style: string | null;
  advanced_footer_map: string | null;
  // Accounting fields
  acct_main_service: string | null;
  acct_service_area: string | null;
  acct_monthly_clients: string | null;
  acct_ideal_client: string | null;
  acct_avg_ticket: string | null;
  acct_client_volume_preference: string | null;
  acct_who_answers: string | null;
  acct_has_script: string | null;
  acct_main_objection: string | null;
  acct_closing_time: string | null;
  acct_years_in_market: string | null;
  acct_companies_served: string | null;
  acct_niches_served: string | null;
  acct_certifications: string | null;
  acct_differentials: string | null;
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
    } catch {
      toast({
        title: 'Erro ao excluir',
        variant: 'destructive',
      });
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('form_responses')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setResponses((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
      
      toast({ title: 'Status atualizado!' });
    } catch {
      toast({
        title: 'Erro ao atualizar status',
        variant: 'destructive',
      });
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed':
        return { label: 'Concluído', icon: CheckCircle2, color: 'text-green-400' };
      case 'in_progress':
        return { label: 'Em andamento', icon: Loader2, color: 'text-yellow-400' };
      case 'pending':
      default:
        return { label: 'Na fila', icon: Clock, color: 'text-muted-foreground' };
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
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Tipo</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Negócio</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Serviço</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Plano</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Data</th>
                      <th className="text-right p-3 text-sm font-medium text-muted-foreground">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {responses.map((response) => {
                      const statusInfo = getStatusInfo(response.status);
                      const StatusIcon = statusInfo.icon;
                      return (
                        <tr key={response.id} className="border-b border-border/50 hover:bg-muted/20">
                          <td className="p-3">
                            <Badge variant="outline" className="text-xs">
                              {response.business_type === 'accounting' ? '🧮 Contabilidade' : '👤 Profissional'}
                            </Badge>
                          </td>
                          <td className="p-3 font-medium">{response.business_name}</td>
                          <td className="p-3 text-muted-foreground">{response.main_service}</td>
                          <td className="p-3">
                            <Badge className={cn('border', getPlanBadgeColor(response.chosen_plan))}>
                              {planInfo[response.chosen_plan]?.name || response.chosen_plan}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Select
                              value={response.status || 'pending'}
                              onValueChange={(value) => handleStatusChange(response.id, value)}
                            >
                              <SelectTrigger className="w-[150px] h-8 text-xs">
                                <div className="flex items-center gap-2">
                                  <StatusIcon className={cn('w-3.5 h-3.5', statusInfo.color)} />
                                  <SelectValue />
                                </div>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                                    Na fila
                                  </div>
                                </SelectItem>
                                <SelectItem value="in_progress">
                                  <div className="flex items-center gap-2">
                                    <Loader2 className="w-3.5 h-3.5 text-yellow-400" />
                                    Em andamento
                                  </div>
                                </SelectItem>
                                <SelectItem value="completed">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                                    Concluído
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
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
                      );
                    })}
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
                  <TabsList className={cn("grid w-full", selectedResponse.business_type === 'accounting' ? 'grid-cols-6' : 'grid-cols-5')}>
                    <TabsTrigger value="basic">Básico</TabsTrigger>
                    <TabsTrigger value="hosting">Hospedagem</TabsTrigger>
                    {selectedResponse.business_type === 'accounting' ? (
                      <TabsTrigger value="accounting">Contabilidade</TabsTrigger>
                    ) : (
                      <>
                        <TabsTrigger value="content">Conteúdo</TabsTrigger>
                        <TabsTrigger value="advanced">Avançado</TabsTrigger>
                      </>
                    )}
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

                  <TabsContent value="hosting" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Opção de Hospedagem</p>
                        <Badge className="mt-1" variant={selectedResponse.hosting_option === 'with' ? 'default' : 'secondary'}>
                          {selectedResponse.hosting_option === 'with' ? 'Com Domínio (.com.br)' : 'Sem Hospedagem'}
                        </Badge>
                      </div>
                    </div>
                    
                    {selectedResponse.hosting_option === 'with' && selectedResponse.domain_registration && (
                      <div className="mt-4 space-y-4">
                        <h4 className="font-semibold text-primary">Dados para Registro do Domínio</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
                          <div className="min-w-0">
                            <p className="text-sm text-muted-foreground">Nome Completo</p>
                            <p className="font-medium break-words">{selectedResponse.domain_registration.fullName || '-'}</p>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm text-muted-foreground">CPF</p>
                            <p className="font-medium break-words">{selectedResponse.domain_registration.cpf || '-'}</p>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm text-muted-foreground">Email</p>
                            <p className="font-medium break-all">{selectedResponse.domain_registration.email || '-'}</p>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm text-muted-foreground">Telefone</p>
                            <p className="font-medium break-words">
                              {selectedResponse.domain_registration.ddd ? `(${selectedResponse.domain_registration.ddd}) ` : ''}
                              {selectedResponse.domain_registration.phone || '-'}
                              {selectedResponse.domain_registration.extension ? ` R. ${selectedResponse.domain_registration.extension}` : ''}
                            </p>
                          </div>
                          <div className="col-span-1 sm:col-span-2 min-w-0">
                            <p className="text-sm text-muted-foreground">Endereço</p>
                            <p className="font-medium break-words">
                              {selectedResponse.domain_registration.address || '-'}
                              {selectedResponse.domain_registration.number ? `, ${selectedResponse.domain_registration.number}` : ''}
                              {selectedResponse.domain_registration.complement ? ` - ${selectedResponse.domain_registration.complement}` : ''}
                            </p>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm text-muted-foreground">Cidade/Estado</p>
                            <p className="font-medium break-words">
                              {selectedResponse.domain_registration.city || '-'} / {selectedResponse.domain_registration.state || '-'}
                            </p>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm text-muted-foreground">CEP</p>
                            <p className="font-medium break-words">{selectedResponse.domain_registration.cep || '-'}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="content" className="space-y-4 mt-4">
                    {selectedResponse.professional_summary && (
                      <div className="min-w-0">
                        <p className="text-sm text-muted-foreground mb-1">Resumo Profissional</p>
                        <div className="text-sm bg-muted/30 p-3 rounded-lg whitespace-pre-wrap break-words overflow-x-auto max-h-64 overflow-y-auto">{selectedResponse.professional_summary}</div>
                      </div>
                    )}
                    {selectedResponse.services && (
                      <div className="min-w-0">
                        <p className="text-sm text-muted-foreground mb-1">Serviços</p>
                        <div className="text-sm bg-muted/30 p-3 rounded-lg whitespace-pre-wrap break-words overflow-x-auto max-h-64 overflow-y-auto">{selectedResponse.services}</div>
                      </div>
                    )}
                    {selectedResponse.location_hours && (
                      <div className="min-w-0">
                        <p className="text-sm text-muted-foreground mb-1">Local e Horário</p>
                        <div className="text-sm bg-muted/30 p-3 rounded-lg whitespace-pre-wrap break-words overflow-x-auto max-h-64 overflow-y-auto">{selectedResponse.location_hours}</div>
                      </div>
                    )}
                    {selectedResponse.main_objective && (
                      <div className="min-w-0">
                        <p className="text-sm text-muted-foreground mb-1">Objetivo Principal</p>
                        <div className="text-sm bg-muted/30 p-3 rounded-lg whitespace-pre-wrap break-words overflow-x-auto max-h-64 overflow-y-auto">{selectedResponse.main_objective}</div>
                      </div>
                    )}
                    {selectedResponse.testimonials_section && (
                      <div className="min-w-0">
                        <p className="text-sm text-muted-foreground mb-1">Depoimentos</p>
                        <div className="text-sm bg-muted/30 p-3 rounded-lg whitespace-pre-wrap break-words overflow-x-auto max-h-64 overflow-y-auto">{formatTestimonials(selectedResponse.testimonials_section)}</div>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="advanced" className="space-y-4 mt-4">
                    {selectedResponse.pain_solutions && (
                      <div className="min-w-0">
                        <p className="text-sm text-muted-foreground mb-1">Dores & Soluções</p>
                        <div className="text-sm bg-muted/30 p-3 rounded-lg whitespace-pre-wrap break-words overflow-x-auto max-h-64 overflow-y-auto">{selectedResponse.pain_solutions}</div>
                      </div>
                    )}
                    {selectedResponse.competitive_differentials && (
                      <div className="min-w-0">
                        <p className="text-sm text-muted-foreground mb-1">Diferenciais</p>
                        <div className="text-sm bg-muted/30 p-3 rounded-lg whitespace-pre-wrap break-words overflow-x-auto max-h-64 overflow-y-auto">{selectedResponse.competitive_differentials}</div>
                      </div>
                    )}
                    {selectedResponse.visual_process && (
                      <div className="min-w-0">
                        <p className="text-sm text-muted-foreground mb-1">Processo de Atendimento</p>
                        <div className="text-sm bg-muted/30 p-3 rounded-lg whitespace-pre-wrap break-words overflow-x-auto max-h-64 overflow-y-auto">{selectedResponse.visual_process}</div>
                      </div>
                    )}
                    {selectedResponse.faq && (
                      <div className="min-w-0">
                        <p className="text-sm text-muted-foreground mb-1">FAQ</p>
                        <div className="text-sm bg-muted/30 p-3 rounded-lg whitespace-pre-wrap break-words overflow-x-auto max-h-64 overflow-y-auto">{selectedResponse.faq}</div>
                      </div>
                    )}
                    {selectedResponse.premium_visual_style && (
                      <div className="min-w-0">
                        <p className="text-sm text-muted-foreground mb-1">Estilo Visual</p>
                        <div className="text-sm bg-muted/30 p-3 rounded-lg whitespace-pre-wrap break-words overflow-x-auto max-h-64 overflow-y-auto">{selectedResponse.premium_visual_style}</div>
                      </div>
                    )}
                    {selectedResponse.advanced_footer_map && (
                      <div className="min-w-0">
                        <p className="text-sm text-muted-foreground mb-1">Endereço</p>
                        <div className="text-sm bg-muted/30 p-3 rounded-lg whitespace-pre-wrap break-words overflow-x-auto max-h-64 overflow-y-auto">{selectedResponse.advanced_footer_map}</div>
                      </div>
                    )}
                  </TabsContent>

                  {/* Accounting tab */}
                  <TabsContent value="accounting" className="space-y-4 mt-4">
                    <h4 className="font-semibold text-primary">Posicionamento e Captação</h4>
                    {selectedResponse.acct_main_service && (
                      <div className="min-w-0">
                        <p className="text-sm text-muted-foreground mb-1">Serviço foco</p>
                        <div className="text-sm bg-muted/30 p-3 rounded-lg">{selectedResponse.acct_main_service}</div>
                      </div>
                    )}
                    {selectedResponse.acct_service_area && (
                      <div className="min-w-0">
                        <p className="text-sm text-muted-foreground mb-1">Área de atendimento</p>
                        <div className="text-sm bg-muted/30 p-3 rounded-lg">{selectedResponse.acct_service_area}</div>
                      </div>
                    )}
                    {selectedResponse.acct_monthly_clients && (
                      <div className="min-w-0">
                        <p className="text-sm text-muted-foreground mb-1">Novos clientes/mês</p>
                        <div className="text-sm bg-muted/30 p-3 rounded-lg">{selectedResponse.acct_monthly_clients}</div>
                      </div>
                    )}

                    <h4 className="font-semibold text-primary pt-2">Perfil do Cliente Ideal</h4>
                    {selectedResponse.acct_ideal_client && (
                      <div className="min-w-0">
                        <p className="text-sm text-muted-foreground mb-1">Cliente ideal</p>
                        <div className="text-sm bg-muted/30 p-3 rounded-lg whitespace-pre-wrap">{selectedResponse.acct_ideal_client}</div>
                      </div>
                    )}
                    {selectedResponse.acct_avg_ticket && (
                      <div className="min-w-0">
                        <p className="text-sm text-muted-foreground mb-1">Ticket médio</p>
                        <div className="text-sm bg-muted/30 p-3 rounded-lg">{selectedResponse.acct_avg_ticket}</div>
                      </div>
                    )}
                    {selectedResponse.acct_client_volume_preference && (
                      <div className="min-w-0">
                        <p className="text-sm text-muted-foreground mb-1">Volume vs porte</p>
                        <div className="text-sm bg-muted/30 p-3 rounded-lg">{selectedResponse.acct_client_volume_preference}</div>
                      </div>
                    )}

                    <h4 className="font-semibold text-primary pt-2">Estratégia Comercial</h4>
                    {selectedResponse.acct_who_answers && (
                      <div className="min-w-0">
                        <p className="text-sm text-muted-foreground mb-1">Quem atende</p>
                        <div className="text-sm bg-muted/30 p-3 rounded-lg">{selectedResponse.acct_who_answers}</div>
                      </div>
                    )}
                    {selectedResponse.acct_has_script && (
                      <div className="min-w-0">
                        <p className="text-sm text-muted-foreground mb-1">Roteiro comercial</p>
                        <div className="text-sm bg-muted/30 p-3 rounded-lg">{selectedResponse.acct_has_script}</div>
                      </div>
                    )}
                    {selectedResponse.acct_main_objection && (
                      <div className="min-w-0">
                        <p className="text-sm text-muted-foreground mb-1">Principal objeção</p>
                        <div className="text-sm bg-muted/30 p-3 rounded-lg whitespace-pre-wrap">{selectedResponse.acct_main_objection}</div>
                      </div>
                    )}
                    {selectedResponse.acct_closing_time && (
                      <div className="min-w-0">
                        <p className="text-sm text-muted-foreground mb-1">Tempo para fechar</p>
                        <div className="text-sm bg-muted/30 p-3 rounded-lg">{selectedResponse.acct_closing_time}</div>
                      </div>
                    )}

                    <h4 className="font-semibold text-primary pt-2">Prova e Autoridade</h4>
                    {selectedResponse.acct_years_in_market && (
                      <div className="min-w-0">
                        <p className="text-sm text-muted-foreground mb-1">Anos de mercado</p>
                        <div className="text-sm bg-muted/30 p-3 rounded-lg">{selectedResponse.acct_years_in_market}</div>
                      </div>
                    )}
                    {selectedResponse.acct_companies_served && (
                      <div className="min-w-0">
                        <p className="text-sm text-muted-foreground mb-1">Empresas atendidas</p>
                        <div className="text-sm bg-muted/30 p-3 rounded-lg">{selectedResponse.acct_companies_served}</div>
                      </div>
                    )}
                    {selectedResponse.acct_niches_served && (
                      <div className="min-w-0">
                        <p className="text-sm text-muted-foreground mb-1">Nichos</p>
                        <div className="text-sm bg-muted/30 p-3 rounded-lg whitespace-pre-wrap">{selectedResponse.acct_niches_served}</div>
                      </div>
                    )}
                    {selectedResponse.acct_certifications && (
                      <div className="min-w-0">
                        <p className="text-sm text-muted-foreground mb-1">Certificações</p>
                        <div className="text-sm bg-muted/30 p-3 rounded-lg whitespace-pre-wrap">{selectedResponse.acct_certifications}</div>
                      </div>
                    )}

                    <h4 className="font-semibold text-primary pt-2">Diferencial Real</h4>
                    {selectedResponse.acct_differentials && (
                      <div className="min-w-0">
                        <p className="text-sm text-muted-foreground mb-1">Diferencial</p>
                        <div className="text-sm bg-muted/30 p-3 rounded-lg whitespace-pre-wrap">{selectedResponse.acct_differentials}</div>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="gallery" className="mt-4 space-y-6">
                    {/* Logo */}
                    {selectedResponse.logo_url && (
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Image className="w-4 h-4" />
                          Logo
                        </h4>
                        <div className="flex items-center gap-4">
                          <img src={selectedResponse.logo_url} alt="Logo" className="w-24 h-24 object-contain rounded-lg border border-border" />
                          <Button size="sm" variant="outline" onClick={() => downloadSingleImage(selectedResponse.logo_url!, `${selectedResponse.business_name}_logo`)}>
                            <Download className="w-4 h-4 mr-2" />
                            Baixar Logo
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Galeria Conversão (2 fotos) */}
                    {(() => {
                      const conversionPhotos = getGalleryPhotos(selectedResponse.conversion_gallery);
                      if (conversionPhotos.length === 0) return null;
                      return (
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Image className="w-4 h-4" />
                            Galeria Conversão ({conversionPhotos.length} fotos)
                            <Button size="sm" variant="outline" className="ml-auto" onClick={() => downloadGalleryPhotos(conversionPhotos, selectedResponse.business_name, 'conversao')}>
                              <Download className="w-4 h-4 mr-2" />
                              Baixar todas
                            </Button>
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {conversionPhotos.map((url, index) => (
                              <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="aspect-square rounded-xl overflow-hidden border-2 border-border hover:border-primary transition-colors">
                                <img src={url} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                              </a>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Galeria Autoridade (8 fotos) */}
                    {(() => {
                      const photos = getGalleryPhotos(selectedResponse.results_gallery);
                      if (photos.length === 0) return null;
                      return (
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Image className="w-4 h-4" />
                            Galeria Autoridade ({photos.length} fotos)
                            <Button size="sm" variant="outline" className="ml-auto" onClick={() => downloadGalleryPhotos(photos, selectedResponse.business_name, 'autoridade')}>
                              <Download className="w-4 h-4 mr-2" />
                              Baixar todas
                            </Button>
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {photos.map((url, index) => (
                              <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="aspect-square rounded-xl overflow-hidden border-2 border-border hover:border-primary transition-colors">
                                <img src={url} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                              </a>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Empty state */}
                    {!selectedResponse.logo_url && 
                     getGalleryPhotos(selectedResponse.conversion_gallery).length === 0 && 
                     getGalleryPhotos(selectedResponse.results_gallery).length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhuma imagem enviada</p>
                      </div>
                    )}
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
    sections.push(`Tipo: ${response.business_type === 'accounting' ? 'Contabilidade' : 'Profissional Liberal'}`);
    sections.push(`Serviço: ${response.main_service}`);
    sections.push(`Plano: ${planInfo[response.chosen_plan]?.name}`);
    sections.push(`WhatsApp: ${response.whatsapp_number}`);
    sections.push(`Cores: ${response.business_colors}`);
    sections.push(`Hospedagem: ${response.hosting_option === 'with' ? 'Com Domínio (.com.br)' : 'Sem Hospedagem'}`);
    
    if (response.logo_url) {
      sections.push(`\nLogo: ${response.logo_url}`);
    }

    // Domain registration data
    if (response.hosting_option === 'with' && response.domain_registration) {
      const d = response.domain_registration;
      sections.push(`\n--- DADOS PARA REGISTRO DO DOMÍNIO ---`);
      sections.push(`Nome Completo: ${d.fullName || '-'}`);
      sections.push(`CPF: ${d.cpf || '-'}`);
      sections.push(`Email: ${d.email || '-'}`);
      sections.push(`Telefone: ${d.ddd ? `(${d.ddd}) ` : ''}${d.phone || '-'}${d.extension ? ` R. ${d.extension}` : ''}`);
      sections.push(`Endereço: ${d.address || '-'}${d.number ? `, ${d.number}` : ''}${d.complement ? ` - ${d.complement}` : ''}`);
      sections.push(`Cidade/Estado: ${d.city || '-'} / ${d.state || '-'}`);
      sections.push(`CEP: ${d.cep || '-'}`);
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
    
    const conversionPhotos = getGalleryPhotos(response.conversion_gallery);
    if (conversionPhotos.length > 0) {
      sections.push(`\n--- GALERIA CONVERSÃO (${conversionPhotos.length} fotos) ---`);
      conversionPhotos.forEach((url, i) => {
        sections.push(`Foto ${i + 1}: ${url}`);
      });
    }

    const photos = getGalleryPhotos(response.results_gallery);
    if (photos.length > 0) {
      sections.push(`\n--- GALERIA AUTORIDADE (${photos.length} fotos) ---`);
      photos.forEach((url, i) => {
        sections.push(`Foto ${i + 1}: ${url}`);
      });
    }

    // Accounting fields
    if (response.business_type === 'accounting') {
      sections.push(`\n--- CONTABILIDADE ---`);
      if (response.acct_main_service) sections.push(`Serviço foco: ${response.acct_main_service}`);
      if (response.acct_service_area) sections.push(`Área: ${response.acct_service_area}`);
      if (response.acct_monthly_clients) sections.push(`Clientes/mês: ${response.acct_monthly_clients}`);
      if (response.acct_ideal_client) sections.push(`Cliente ideal: ${response.acct_ideal_client}`);
      if (response.acct_avg_ticket) sections.push(`Ticket médio: ${response.acct_avg_ticket}`);
      if (response.acct_client_volume_preference) sections.push(`Volume/porte: ${response.acct_client_volume_preference}`);
      if (response.acct_who_answers) sections.push(`Quem atende: ${response.acct_who_answers}`);
      if (response.acct_has_script) sections.push(`Roteiro: ${response.acct_has_script}`);
      if (response.acct_main_objection) sections.push(`Objeção: ${response.acct_main_objection}`);
      if (response.acct_closing_time) sections.push(`Tempo fechamento: ${response.acct_closing_time}`);
      if (response.acct_years_in_market) sections.push(`Anos: ${response.acct_years_in_market}`);
      if (response.acct_companies_served) sections.push(`Empresas: ${response.acct_companies_served}`);
      if (response.acct_niches_served) sections.push(`Nichos: ${response.acct_niches_served}`);
      if (response.acct_certifications) sections.push(`Certificações: ${response.acct_certifications}`);
      if (response.acct_differentials) sections.push(`Diferencial: ${response.acct_differentials}`);
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

  async function downloadSingleImage(url: string, filename: string) {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const ext = url.split('.').pop()?.split('?')[0] || 'jpg';
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filename.replace(/\s+/g, '_')}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      toast({ title: 'Download iniciado!' });
    } catch (error) {
      console.error('Download error:', error);
      toast({ title: 'Erro no download', variant: 'destructive' });
    }
  }

  async function downloadGalleryPhotos(photos: string[], businessName: string, galleryType: string) {
    if (photos.length === 0) return;

    toast({ title: 'Iniciando downloads...' });

    for (let i = 0; i < photos.length; i++) {
      const url = photos[i];
      try {
        const res = await fetch(url);
        const blob = await res.blob();
        const ext = url.split('.').pop()?.split('?')[0] || 'jpg';
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${businessName.replace(/\s+/g, '_')}_${galleryType}_${i + 1}.${ext}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.error('Download error:', error);
      }
    }
    
    toast({ title: `${photos.length} fotos baixadas!` });
  }
}
