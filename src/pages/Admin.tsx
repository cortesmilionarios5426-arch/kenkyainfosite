import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { LogIn, LogOut, Trash2, Eye, RefreshCw, Users, FileText } from 'lucide-react';
import { planInfo } from '@/types/form';
import { cn } from '@/lib/utils';

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
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        // Check if user is admin
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'admin');
        
        setIsAdmin(roles && roles.length > 0);
        
        if (roles && roles.length > 0) {
          fetchResponses();
        }
      } else {
        setIsAdmin(false);
        setResponses([]);
      }
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'admin');
        
        setIsAdmin(roles && roles.length > 0);
        
        if (roles && roles.length > 0) {
          fetchResponses();
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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
    await supabase.auth.signOut();
    toast({ title: 'Logout realizado' });
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

  // Logged in but not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md glass-card border-border text-center">
          <CardHeader>
            <CardTitle className="text-2xl text-destructive">Acesso Negado</CardTitle>
            <CardDescription>
              Você não tem permissão para acessar este painel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Sair
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
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto glass-card border-border">
            <DialogHeader>
              <DialogTitle className="gradient-text">{selectedResponse?.business_name}</DialogTitle>
              <DialogDescription>{selectedResponse?.main_service}</DialogDescription>
            </DialogHeader>
            
            {selectedResponse && (
              <Tabs defaultValue="basic" className="mt-4">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="basic">Básico</TabsTrigger>
                  <TabsTrigger value="content">Conteúdo</TabsTrigger>
                  <TabsTrigger value="advanced">Avançado</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">WhatsApp</p>
                      <p className="font-medium">{selectedResponse.whatsapp_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Cores</p>
                      <p className="font-medium">{selectedResponse.business_colors}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Plano</p>
                      <Badge className={cn('border', getPlanBadgeColor(selectedResponse.chosen_plan))}>
                        {planInfo[selectedResponse.chosen_plan]?.name}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Redes Sociais</p>
                      <p className="font-medium">
                        {Array.isArray(selectedResponse.social_networks) 
                          ? selectedResponse.social_networks.length + ' redes'
                          : '0 redes'}
                      </p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="content" className="space-y-4 mt-4">
                  {selectedResponse.professional_summary && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Resumo Profissional</p>
                      <p className="text-sm bg-muted/30 p-3 rounded-lg">{selectedResponse.professional_summary}</p>
                    </div>
                  )}
                  {selectedResponse.services && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Serviços</p>
                      <p className="text-sm bg-muted/30 p-3 rounded-lg">{selectedResponse.services}</p>
                    </div>
                  )}
                  {selectedResponse.location_hours && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Local e Horário</p>
                      <p className="text-sm bg-muted/30 p-3 rounded-lg">{selectedResponse.location_hours}</p>
                    </div>
                  )}
                  {selectedResponse.main_objective && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Objetivo Principal</p>
                      <p className="text-sm bg-muted/30 p-3 rounded-lg">{selectedResponse.main_objective}</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="advanced" className="space-y-4 mt-4">
                  {selectedResponse.pain_solutions && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Dores & Soluções</p>
                      <p className="text-sm bg-muted/30 p-3 rounded-lg">{selectedResponse.pain_solutions}</p>
                    </div>
                  )}
                  {selectedResponse.competitive_differentials && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Diferenciais</p>
                      <p className="text-sm bg-muted/30 p-3 rounded-lg">{selectedResponse.competitive_differentials}</p>
                    </div>
                  )}
                  {selectedResponse.testimonials_section && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Depoimentos</p>
                      <p className="text-sm bg-muted/30 p-3 rounded-lg">{selectedResponse.testimonials_section}</p>
                    </div>
                  )}
                  {selectedResponse.faq && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">FAQ</p>
                      <p className="text-sm bg-muted/30 p-3 rounded-lg">{selectedResponse.faq}</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
